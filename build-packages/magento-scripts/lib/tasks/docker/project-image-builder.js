const path = require('path');
const { DockerFileBuilder } = require('@scandipwa/dockerfile');
const { execAsyncSpawn } = require('../../util/exec-async-command');
const KnownError = require('../../errors/known-error');
const { runContainerImage } = require('../../util/run-container-image');

/**
 * Get enabled extensions list with versions
 * @param {import('../../../typings/context').ListrContext['config']} config
 * @returns {Promise<{[key: string]: string}}>}
 */
const getEnabledExtensions = async (config) => {
    const output = await runContainerImage(
        `create-magento-app:php-${config.php.version}`,
        'php -r \'foreach (get_loaded_extensions() as $extension) echo "$extension:" . phpversion($extension) . "\n";\''
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

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const projectImageBuilder = () => ({
    title: 'Project Image builder',
    task: async (ctx, task) => {
        const existingPHPExtensions = await getEnabledExtensions(ctx.config);
        const dockerFile = new DockerFileBuilder()
            .from({
                image: 'create-magento-app',
                tag: 'php-8.1'
            });
            // .run('apk add --no-cache bash')
            // .shell(['/bin/bash', '-c']);

        // eslint-disable-next-line max-len
        const missingExtensions = Object.entries(ctx.config.overridenConfiguration.configuration.php.extensions).filter(([name, options]) => {
            const extensionName = options.extensionName || name;

            return !disabledExtensions.includes(extensionName);
        });

        //         try {
        //             await execAsyncSpawn(`docker build -t cma-local-project:${ctx.config.baseConfig.prefix} -<<EOF
        // ${dockerFile}
        // EOF`, {
        //                 callback: (r) => {
        //                     task.output = r;
        //                 }
        //             });
        //         } catch (e) {
        //             throw new KnownError(`Unexpected error during project image building!\n\n${e}`);
        //         }
    },
    options: {
        bottomBar: 10
    }
});

module.exports = {
    projectImageBuilder
};
