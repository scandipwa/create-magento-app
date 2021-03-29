/* eslint-disable no-param-reassign */
const { getConfigFromMagentoVersion } = require('.');

/**
 * @type {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const getConfigFromConfigFile = {
    task: async (ctx, task) => {
        const { magentoVersion } = ctx;

        if (!ctx.config) {
            task.title = 'Getting config from configuration file';
        }

        ctx.config = await getConfigFromMagentoVersion(magentoVersion);
    }
};

module.exports = getConfigFromConfigFile;
