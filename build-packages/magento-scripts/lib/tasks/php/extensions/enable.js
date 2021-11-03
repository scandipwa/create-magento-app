/* eslint-disable max-len */
const { execAsyncSpawn } = require('../../../util/exec-async-command');

/**
 * @param {String} extensionName
 * @param {import('../../../../typings/index').PHPExtension} extensionOptions
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const enableExtension = (extensionName, extensionOptions) => ({
    title: `Enabling ${extensionName} extension`,
    task: async (ctx, task) => {
        const {
            config,
            config: { php }
        } = ctx;
        const { hooks } = extensionOptions;

        if (extensionOptions.enable) {
            await Promise.resolve(extensionOptions.enable(ctx, task));
        } else {
            if (hooks && hooks.postEnable) {
                await Promise.resolve(hooks.postEnable(config));
            }

            await execAsyncSpawn(`source ~/.phpbrew/bashrc && \
            phpbrew use ${ php.version } && \
            phpbrew ext enable ${ extensionName }`,
            {
                callback: (t) => {
                    task.output = t;
                }
            });

            if (hooks && hooks.postEnable) {
                await Promise.resolve(hooks.postEnable(config));
            }
        }
    },
    options: {
        bottomBar: 10
    }
});

module.exports = enableExtension;
