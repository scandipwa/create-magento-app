/* eslint-disable max-len */
const phpbrewConfig = require('../../../config/phpbrew');
const { execAsyncSpawn } = require('../../../util/exec-async-command');

/**
 * @param {String} extensionName
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const disableExtension = (extensionName) => ({
    title: `Disabling ${extensionName} extension`,
    task: async (ctx, task) => {
        const {
            config,
            config: { php }
        } = ctx;
        const extensionOptions = php.extensions[extensionName] || {};
        const { hooks } = extensionOptions;
        if (extensionOptions.disable) {
            await Promise.resolve(extensionOptions.disable(ctx, task));
        } else {
            if (hooks && hooks.preDisable) {
                await Promise.resolve(hooks.preDisable(config));
            }
            await execAsyncSpawn(`source ${phpbrewConfig.bashrcPath} && \
            phpbrew use ${ php.version } && \
            phpbrew ext disable ${ extensionName }`,
            {
                callback: (t) => {
                    task.output = t;
                }
            });
            if (hooks && hooks.postDisable) {
                await Promise.resolve(hooks.postDisable(config));
            }
        }
    },
    options: {
        bottomBar: 10
    }
});

module.exports = disableExtension;
