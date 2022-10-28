const path = require('path')
const os = require('os')
const { DockerFileBuilder } = require('../../util/dockerfile-builder')
const { execAsyncSpawn } = require('../../util/exec-async-command')
const KnownError = require('../../errors/known-error')
const { runContainerImage } = require('../../util/run-container-image')
const { imageApi } = require('./image')

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
 * @type {(builder: DockerFileBuilder, ctx: import('../../../typings/context').ListrContext) => ([extensionName, extensionInstructions]: [string, import('../../../typings').PHPExtensionInstallationInstruction]) => Promise<void>}
 */
const addExtensionToBuilder =
    (builder, ctx) =>
    async ([extensionName, extensionInstructions]) => {
        const { command, ...extensionInstructionsWithoutCommand } =
            extensionInstructions
        let runCommand = ''
        if (typeof command === 'string') {
            runCommand += ` ${command}`
        } else if (command instanceof Promise) {
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
 * @param {{ image: string, tag: string}} param1
 */
const buildDockerFileInstructions = async (ctx, { image, tag }) => {
    const { composer } = ctx.config.overridenConfiguration.configuration
    const existingPHPExtensions = await getEnabledExtensionsFromImage(
        `${image}:${tag}`
    )
    const imageDetails = await imageApi.inspect({
        image: `${image}:${tag}`,
        formatToJSON: true
    })

    const missingExtensions = Object.entries(
        ctx.config.overridenConfiguration.configuration.php.extensions
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
        .filter(([extensionName]) => extensionName.toLowerCase() !== 'xdebug')

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
                ctx
            )(missingExtensionInstructions)
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

    if (composer.plugins && Object.values(composer.plugins).length > 0) {
        for (const [pluginName, pluginOptions] of Object.entries(
            composer.plugins
        )) {
            if (pluginOptions.enabled) {
                dockerFileInstructions
                    .comment(`install ${pluginName} composer global package`)

                    .run(
                        `composer global require ${pluginName}${
                            pluginOptions.options
                                ? ` ${pluginOptions.options}`
                                : ''
                        }${
                            pluginOptions.options
                                ? ` ${pluginOptions.options}`
                                : ''
                        }`
                    )
            }
        }
    }

    if (!ctx.isDockerDesktop) {
        dockerFileInstructions.run(
            `chown -R ${os.userInfo().uid}:${os.userInfo().gid} /composer/home`
        )
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

    return dockerFileInstructions
}

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const buildProjectImage = () => ({
    title: 'Building Project Image',
    task: async (ctx, task) => {
        const containers = ctx.config.docker.getContainers(ctx.ports)
        const [image, tag = 'latest'] =
            ctx.config.overridenConfiguration.configuration.php.baseImage.split(
                ':'
            )
        const dockerFileInstructions = await buildDockerFileInstructions(ctx, {
            image,
            tag
        })

        try {
            await execAsyncSpawn(
                `docker build -t ${containers.php.image} -<<EOF
${dockerFileInstructions.build()}
EOF`,
                {
                    callback: (r) => {
                        task.output = r
                    }
                }
            )
        } catch (e) {
            throw new KnownError(
                `Unexpected error during project image building!\n\n${e}`
            )
        }
    },
    options: {
        bottomBar: 10
    }
})

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const buildDebugProjectImage = () => ({
    title: 'Building Debug Project Image',
    task: async (ctx, task) => {
        const containers = ctx.config.docker.getContainers(ctx.ports)
        const [image, tag = 'latest'] =
            ctx.config.overridenConfiguration.configuration.php.debugImage.split(
                ':'
            )
        const dockerFileInstructions = await buildDockerFileInstructions(ctx, {
            image,
            tag
        })

        try {
            await execAsyncSpawn(
                `docker build -t ${containers.php.debugImage} -<<EOF
${dockerFileInstructions.build()}
EOF`,
                {
                    callback: (r) => {
                        task.output = r
                    }
                }
            )
        } catch (e) {
            throw new KnownError(
                `Unexpected error during debug project image building!\n\n${e}`
            )
        }
    },
    options: {
        bottomBar: 10
    }
})

module.exports = {
    buildProjectImage,
    buildDebugProjectImage,
    getEnabledExtensionsFromImage
}
