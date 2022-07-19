const { DockerFileBuilder } = require('@scandipwa/dockerfile');
const semver = require('semver');
const { execAsyncSpawn } = require('../../util/exec-async-command');
const KnownError = require('../../errors/known-error');
const xdebugExtension = require('../../config/php/extensions/xdebug');
const { runContainerImage } = require('../../util/run-container-image');

/**
 * Get enabled extensions list with versions
 * @param {string} imageWithTag
 * @returns {Promise<{[key: string]: string}}>}
 */
const getEnabledExtensionsFromImage = async (imageWithTag) => {
    const output = await runContainerImage(
        imageWithTag,
        // eslint-disable-next-line quotes
        `php -r 'foreach (get_loaded_extensions() as $extension) echo "$extension:" . phpversion($extension) . "\n";'`
    );

    return output
        .split('\n')
        .map((m) => {
            // eslint-disable-next-line no-unused-vars
            const [_, moduleName, moduleVersion] = m.match(/(.+):(.+)/i);

            return [moduleName, moduleVersion];
        })
        .reduce((acc, [name, version]) => ({ ...acc, [name]: version }), {});
};

const addExtensionToBuilder = (builder, ctx) => ([extensionName, extensionInstructions]) => {
    const { command, ...extensionInstructionsWithoutCommand } = extensionInstructions;
    let runCommand = '';
    // if (extensionInstructionsWithoutCommand.dependencies && extensionInstructionsWithoutCommand.dependencies.length > 0) {
    //     runCommand += `apk add --no-cache ${extensionInstructionsWithoutCommand.dependencies.join(' ')} &&`;
    // }
    if (typeof command === 'string') {
        runCommand += ` ${command}`;
    } else if (typeof command === 'function') {
        runCommand += ` ${command({ ...extensionInstructionsWithoutCommand, ctx })}`;
    } else {
        runCommand += ` docker-php-ext-install ${extensionInstructionsWithoutCommand.name}`;
    }
    builder
        .comment(`extension ${extensionName} installation command`)
        .run(runCommand.trim());
};

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const buildProjectImage = () => ({
    title: 'Building Project Image',
    task: async (ctx, task) => {
        const {
            php: {
                baseImage: image,
                tag
            },
            composer
        } = ctx.config.overridenConfiguration.configuration;
        const containers = ctx.config.docker.getContainers(ctx.ports);
        const existingPHPExtensions = await getEnabledExtensionsFromImage(`${image}:${tag}`);

        const missingExtensions = Object.entries(
            ctx.config.overridenConfiguration.configuration.php.extensions
        ).filter(
            ([extensionName, extensionInstructions]) => !Object.entries(existingPHPExtensions)
                .map(([n, i]) => [n.toLowerCase(), i])
                .some(
                    ([n]) => extensionName === n || (
                        extensionInstructions.alternativeName && extensionInstructions.alternativeName.map(
                            (s) => s.toLowerCase()
                        ).includes(n)
                    )
                )
        ).filter(([extensionName]) => extensionName.toLowerCase() !== 'xdebug');

        const dockerFileInstructions = new DockerFileBuilder()
            .comment('project image')
            .from({ image, tag });

        // install bash in image
        dockerFileInstructions
            .run('apk add --no-cache bash');

        if (missingExtensions.length > 0) {
            const allDependencies = missingExtensions.map(
                ([_extensionName, extensionInstructions]) => (extensionInstructions.dependencies || [])
            )
                .reduce((acc, val) => acc.concat(val.filter((ex) => !acc.includes(ex))), []);

            dockerFileInstructions.run(`apk add --no-cache ${allDependencies.join(' ')}`);
            missingExtensions.forEach(addExtensionToBuilder(dockerFileInstructions, ctx));
        }

        const composerVersion = /^\d$/.test(composer.version)
            ? `latest-${composer.version}.x`
            : composer.version;

        dockerFileInstructions
            .comment('download composer')
            .run(`curl https://getcomposer.org/download/${composerVersion}/composer.phar --output composer`)
            .comment('make composer executable')
            .run('chmod +x ./composer')
            .comment('move composer to bin directory')
            .run('mv composer /usr/local/bin/composer');

        if (semver.satisfies(composer.version, '^1')) {
            dockerFileInstructions
                .comment('install prestissimo composer plugin')
                .run('composer global require hirak/prestissimo');
        }

        dockerFileInstructions
            .workDir('/var/www/html');

        try {
            await execAsyncSpawn(`docker build -t ${containers.php.imageDetails.name}:${containers.php.imageDetails.tag} -<<EOF
${dockerFileInstructions.build()}
EOF`, {
                callback: (r) => {
                    task.output = r;
                }
            });
        } catch (e) {
            throw new KnownError(`Unexpected error during project image building!\n\n${e}`);
        }
    },
    options: {
        bottomBar: 10
    }
});

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const buildXDebugProjectImage = () => ({
    title: 'Building Project Image with XDebug',
    task: async (ctx, task) => {
        const containers = ctx.config.docker.getContainers(ctx.ports);
        const dockerFileInstructionsWithXDebug = new DockerFileBuilder()
            .from({
                image: containers.php.imageDetails.name,
                tag: containers.php.imageDetails.tag
            });

        dockerFileInstructionsWithXDebug.run('echo \\$PHPIZE_DEPS');

        addExtensionToBuilder(dockerFileInstructionsWithXDebug, ctx)(['xdebug', xdebugExtension]);

        try {
            await execAsyncSpawn(`docker build -t ${containers.php.imageDetails.name}:${containers.php.imageDetails.tag}.xdebug -<<EOF
${dockerFileInstructionsWithXDebug.build()}
EOF`, {
                callback: (r) => {
                    task.output = r;
                }
            });
        } catch (e) {
            throw new KnownError(`Unexpected error during project image with xdebug building!\n\n${e}`);
        }
    },
    options: {
        bottomBar: 10
    }
});

module.exports = {
    buildProjectImage,
    buildXDebugProjectImage,
    getEnabledExtensions: getEnabledExtensionsFromImage
};
