const { DockerFileBuilder } = require('../../util/dockerfile-builder');
const semver = require('semver');
const { execAsyncSpawn } = require('../../util/exec-async-command');
const KnownError = require('../../errors/known-error');
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
 * @param {import('../../../typings/context').ListrContext} ctx
 * @param {{ image: string, tag: string}} param1
 */
const buildDockerFileInstructions = async (ctx, { image, tag }) => {
    const { composer } = ctx.config.overridenConfiguration.configuration;
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

    return dockerFileInstructions;
};

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const buildProjectImage = () => ({
    title: 'Building Project Image',
    task: async (ctx, task) => {
        const containers = ctx.config.docker.getContainers(ctx.ports);
        const [image, tag = 'latest'] = ctx.config.overridenConfiguration.configuration.php.baseImage.split(':');
        const dockerFileInstructions = await buildDockerFileInstructions(ctx, { image, tag });

        try {
            await execAsyncSpawn(`docker build -t ${containers.php.image} -<<EOF
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
const buildDebugProjectImage = () => ({
    title: 'Building Debug Project Image',
    task: async (ctx, task) => {
        const containers = ctx.config.docker.getContainers(ctx.ports);
        const [image, tag = 'latest'] = ctx.config.overridenConfiguration.configuration.php.debugImage.split(':');
        const dockerFileInstructions = await buildDockerFileInstructions(ctx, { image, tag });

        try {
            await execAsyncSpawn(`docker build -t ${containers.php.debugImage} -<<EOF
${dockerFileInstructions.build()}
EOF`, {
                callback: (r) => {
                    task.output = r;
                }
            });
        } catch (e) {
            throw new KnownError(`Unexpected error during debug project image building!\n\n${e}`);
        }
    },
    options: {
        bottomBar: 10
    }
});

module.exports = {
    buildProjectImage,
    buildDebugProjectImage,
    getEnabledExtensionsFromImage
};
