const path = require('path')
const os = require('os')
const { DockerFileBuilder } = require('../../util/dockerfile-builder')
const { execAsyncSpawn } = require('../../util/exec-async-command')
const KnownError = require('../../errors/known-error')
const { runContainerImage } = require('../../util/run-container-image')
const { imageApi } = require('./image')
const { getArchSync } = require('../../util/arch')

const rosettaTranslatedContainers =
    os.platform() === 'darwin' &&
    getArchSync() === 'arm64' &&
    process.env.CMA_USE_AMD64_CONTAINERS
        ? process.env.CMA_USE_AMD64_CONTAINERS.split(',')
        : []
/**
 * Get enabled extensions list with versions
 * @param {string} imageWithTag
 * @returns {Promise<{[key: string]: string}>}>}
 */
const getEnabledExtensionsFromImage = async (imageWithTag) => {
    const output = await runContainerImage(
        imageWithTag,
        `php -r 'foreach (get_loaded_extensions() as $extension) echo "$extension:" . phpversion($extension) . "\n";'`
    )

    return output
        .split('\n')
        .map((m) => {
            const moduleMatch = m.match(/(.+):(.+)/i)

            if (moduleMatch) {
                const [_, moduleName, moduleVersion] = moduleMatch

                return [moduleName, moduleVersion]
            }

            return []
        })
        .filter((a) => a.length > 0)
        .reduce((acc, [name, version]) => ({ ...acc, [name]: version }), {})
}

/**
 * @type {(builder: DockerFileBuilder, ctx: import('../../../typings/context').ListrContext, [extensionName, extensionInstructions]: [string, import('../../../typings').PHPExtensionInstallationInstruction]) => Promise<void>}
 */
const addExtensionToBuilder = async (
    builder,
    ctx,
    [extensionName, extensionInstructions]
) => {
    const { command, ...extensionInstructionsWithoutCommand } =
        extensionInstructions
    let runCommand = ''
    if (typeof command === 'string') {
        runCommand += ` ${command}`
    } else if (typeof command === 'function') {
        runCommand += ` ${await Promise.resolve(
            command({ ...extensionInstructionsWithoutCommand, ctx })
        )}`
    } else {
        runCommand += ` docker-php-ext-install ${
            extensionInstructionsWithoutCommand.name || extensionName
        }`
    }
    builder
        .comment(`extension ${extensionName} installation command`)
        .run(runCommand.trim())
}

/**
 * @param {import('../../../typings/context').ListrContext} ctx
 * @param {{ image: string, tag: string, ignorePHPExtensions?: string[] }} param1
 */
const buildDockerFileInstructions = async (
    ctx,
    { image, tag, ignorePHPExtensions = [] }
) => {
    const { composer, php } = ctx.config.overridenConfiguration.configuration
    const existingPHPExtensions = await getEnabledExtensionsFromImage(
        `${image}:${tag}`
    )
    const imageDetails = await imageApi.inspect({
        image: `${image}:${tag}`,
        formatToJSON: true
    })

    const missingExtensions = Object.entries(php.extensions)
        .filter(
            ([extensionName]) =>
                !ignorePHPExtensions.includes(extensionName.toLowerCase())
        )
        .filter(
            ([extensionName, extensionInstructions]) =>
                !Object.entries(existingPHPExtensions)
                    .map(([n, i]) => [n.toLowerCase(), i])
                    .some(
                        ([n]) =>
                            extensionName === n ||
                            (extensionInstructions.alternativeName &&
                                extensionInstructions.alternativeName
                                    .map((s) => s.toLowerCase())
                                    .includes(n))
                    )
        )

    const dockerFileInstructions = new DockerFileBuilder()
        .comment('project image')
        .from({ image, tag })

    if (missingExtensions.length > 0) {
        const allDependencies = missingExtensions
            .map(
                ([_extensionName, extensionInstructions]) =>
                    extensionInstructions.dependencies || []
            )
            .reduce(
                (acc, val) => acc.concat(val.filter((ex) => !acc.includes(ex))),
                []
            )

        dockerFileInstructions.run(
            `apk add --no-cache ${allDependencies.join(' ')}`
        )
        for (const missingExtensionInstructions of missingExtensions) {
            await addExtensionToBuilder(
                dockerFileInstructions,
                ctx,
                missingExtensionInstructions
            )
        }
    }

    const composerVersion = /^\d$/.test(composer.version)
        ? `latest-${composer.version}.x`
        : composer.version

    dockerFileInstructions
        .comment('download composer')
        .run(
            `curl https://getcomposer.org/download/${composerVersion}/composer.phar --output composer`
        )
        .comment('make composer executable')
        .run('chmod +x ./composer')
        .comment('move composer to bin directory')
        .run('mv composer /usr/local/bin/composer')
        .run('mkdir -p /composer/home/cache')
        .env({
            COMPOSER_HOME: '/composer/home',
            COMPOSER_CACHE_DIR: '/composer/home/cache'
        })
        .run(
            `curl https://composer.github.io/snapshots.pub > /composer/home/keys.dev.pub`
        )
        .run(
            `curl https://composer.github.io/releases.pub > /composer/home/keys.tags.pub`
        )

    if (composer.plugins && Object.values(composer.plugins).length > 0) {
        for (const [pluginName, pluginOptions] of Object.entries(
            composer.plugins
        )) {
            if (pluginOptions.enabled) {
                const pluginVersion = pluginOptions.version
                dockerFileInstructions
                    .comment(
                        `install ${pluginName}${
                            pluginVersion ? ` (version ${pluginVersion})` : ''
                        } composer global package`
                    )

                    .run(
                        `composer global require ${pluginName}${
                            pluginVersion ? `:${pluginVersion}` : ''
                        }${
                            pluginOptions.options
                                ? ` ${pluginOptions.options}`
                                : ''
                        }`
                    )
            }
        }
    }

    if (ctx.platform === 'linux') {
        const { gid, username } = os.userInfo()
        dockerFileInstructions.run(
            `addgroup -g ${gid} ${username} && adduser -u ${gid} -G ${username} -H -s /sbin/nologin -D ${username} && \
                addgroup www-data ${username}`
        )

        if (ctx.isDockerDesktop) {
            dockerFileInstructions.run(
                `chown -R ${username}:${username} /composer/home/cache`
            )
        }
    }

    dockerFileInstructions.workDir(ctx.config.baseConfig.containerMagentoDir)

    const imagePathEnv = imageDetails.Config.Env.find((env) =>
        env.startsWith('PATH')
    )
    const magentoBinDir = path.join(
        ctx.config.baseConfig.containerMagentoDir,
        'bin'
    )
    const vendorBinDir = path.join(
        ctx.config.baseConfig.containerMagentoDir,
        'vendor',
        'bin'
    )

    if (imagePathEnv) {
        dockerFileInstructions.env({
            PATH: `${imagePathEnv
                .split('=')
                .pop()}:${magentoBinDir}:${vendorBinDir}`
        })
    }

    const { newRelic } = ctx.config.overridenConfiguration.configuration

    if (newRelic && newRelic.enabled) {
        const { agentVersion, licenseKey } = newRelic

        // eslint-disable-next-line max-len
        dockerFileInstructions.run('apk add --no-cache gcompat')
            .run(`curl -L https://download.newrelic.com/php_agent/archive/${agentVersion}/newrelic-php5-${agentVersion}-linux.tar.gz | tar -C /tmp -zx \
&& export NR_INSTALL_USE_CP_NOT_LN=1 \
&& export NR_INSTALL_SILENT=1 \
&& /tmp/newrelic-php5-${agentVersion}-linux/newrelic-install install \
&& rm -rf /tmp/newrelic-php5-* /tmp/nrinstall*`)
            .run(`sed -i -e "s/REPLACE_WITH_REAL_KEY/${licenseKey}/" \
-e "s/newrelic.appname[[:space:]]=[[:space:]].*/newrelic.appname=\\"${
            ctx.config.baseConfig.prefix
        }\\"/" \
-e '\\$anewrelic.daemon.address="${
            ctx.isDockerDesktop ? 'host.docker.internal' : 'localhost'
        }:31339"' \
\\$PHP_INI_DIR/conf.d/newrelic.ini`)
    }

    return dockerFileInstructions.build()
}

/**
 * @param {import('../../../typings/context').ListrContext} ctx
 * @param {{ image: string, tag: string }} param1
 */
const buildDebugDockerFileInstructions = async (ctx, { image, tag }) => {
    const { php } = ctx.config.overridenConfiguration.configuration
    const existingPHPExtensions = await getEnabledExtensionsFromImage(
        `${image}:${tag}`
    )

    const missingExtensions = Object.entries(php.extensions)
        .filter(([extensionName]) => extensionName.toLowerCase() === 'xdebug')
        .filter(
            ([extensionName, extensionInstructions]) =>
                !Object.entries(existingPHPExtensions)
                    .map(([n, i]) => [n.toLowerCase(), i])
                    .some(
                        ([n]) =>
                            extensionName === n ||
                            (extensionInstructions.alternativeName &&
                                extensionInstructions.alternativeName
                                    .map((s) => s.toLowerCase())
                                    .includes(n))
                    )
        )

    const dockerFileInstructions = new DockerFileBuilder()
        .comment('project image')
        .from({ image, tag })

    if (missingExtensions.length > 0) {
        const allDependencies = missingExtensions
            .map(
                ([_extensionName, extensionInstructions]) =>
                    extensionInstructions.dependencies || []
            )
            .reduce(
                (acc, val) => acc.concat(val.filter((ex) => !acc.includes(ex))),
                []
            )

        dockerFileInstructions.run(
            `apk add --no-cache ${allDependencies.join(' ')}`
        )
        for (const missingExtensionInstructions of missingExtensions) {
            await addExtensionToBuilder(
                dockerFileInstructions,
                ctx,
                missingExtensionInstructions
            )
        }
    }

    return dockerFileInstructions.build()
}

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const buildProjectImage = () => ({
    title: rosettaTranslatedContainers.includes('php')
        ? 'Building Project Images (for x86)'
        : 'Building Project Images',
    task: async (ctx, task) => {
        const containers = ctx.config.docker.getContainers(ctx.ports)

        return task.newListr([
            {
                title: rosettaTranslatedContainers.includes('php')
                    ? 'Building PHP image (for x86)'
                    : 'Building PHP image',
                task: async () => {
                    const [image, tag = 'latest'] =
                        ctx.config.overridenConfiguration.configuration.php.baseImage.split(
                            ':'
                        )
                    const dockerFileInstructions =
                        await buildDockerFileInstructions(ctx, {
                            image,
                            tag,
                            ignorePHPExtensions: ['xdebug']
                        })

                    try {
                        await execAsyncSpawn(
                            `docker build -t ${containers.php.image}${
                                rosettaTranslatedContainers.includes('php')
                                    ? ' --platform linux/amd64'
                                    : ''
                            } -<<EOF
${dockerFileInstructions}
EOF`,
                            {
                                callback: !ctx.verbose
                                    ? undefined
                                    : (t) => {
                                          task.output = t
                                      }
                            }
                        )
                    } catch (e) {
                        throw new KnownError(
                            `Unexpected error during PHP image building!\n\n${e}`
                        )
                    }
                }
            },
            {
                title: rosettaTranslatedContainers.includes('php')
                    ? 'Building PHP with XDebug image (for x86)'
                    : 'Building PHP with XDebug image',
                task: async () => {
                    const [phpImage, phpTag] = containers.php.image.split(':')
                    const debugImageInstructions =
                        await buildDebugDockerFileInstructions(ctx, {
                            image: phpImage,
                            tag: phpTag
                        })

                    try {
                        await execAsyncSpawn(
                            `docker build -t ${containers.phpWithXdebug.image}${
                                rosettaTranslatedContainers.includes('php')
                                    ? ' --platform linux/amd64'
                                    : ''
                            } -<<EOF
${debugImageInstructions}
EOF`,
                            {
                                callback: !ctx.verbose
                                    ? undefined
                                    : (t) => {
                                          task.output = t
                                      }
                            }
                        )
                    } catch (e) {
                        throw new KnownError(
                            `Unexpected error during PHP with XDebug image building!\n\n${e}`
                        )
                    }
                }
            }
        ])
    },
    options: {
        bottomBar: 10
    }
})

module.exports = {
    buildProjectImage,
    getEnabledExtensionsFromImage
}
