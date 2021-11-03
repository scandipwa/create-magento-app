/* eslint-disable max-len */
const macosVersion = require('macos-version');
const { execAsyncSpawn } = require('../../../util/exec-async-command');

/**
 * @param {String} extensionName
 * @param {import('../../../../typings/index').PHPExtension} extensionOptions
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const installExtension = (extensionName, extensionOptions) => ({
    title: `Installing ${extensionName} extension`,
    task: async (ctx, task) => {
        const {
            config,
            config: { php }
        } = ctx;
        const { hooks } = extensionOptions;

        if (extensionOptions.install) {
            await Promise.resolve(extensionOptions.install(ctx, task));
        } else {
            const options = macosVersion.isMacOS ? extensionOptions.macosOptions : extensionOptions.linuxOptions;

            if (hooks && hooks.preInstall) {
                await Promise.resolve(hooks.preInstall(config));
            }

            await execAsyncSpawn(`source ~/.phpbrew/bashrc && \
                phpbrew use ${ php.version } && \
                phpbrew ext install ${ extensionName }${ extensionOptions.version ? ` ${extensionOptions.version}` : ''}${ options ? ` -- ${ options }` : ''}`,
            {
                callback: (t) => {
                    task.output = t;
                }
            });

            if (hooks && hooks.postInstall) {
                await Promise.resolve(hooks.postInstall(config));
            }
        }
    },
    options: {
        bottomBar: 10
    }
});

module.exports = installExtension;
