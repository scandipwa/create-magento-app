/* eslint-disable no-param-reassign */
const { getConfigFromMagentoVersion } = require('./index');

/**
 * @type {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const getProjectConfiguration = {
    title: 'Getting project configuration',
    task: async (ctx) => {
        const { magentoVersion } = ctx;

        ctx.config = await getConfigFromMagentoVersion(magentoVersion, process.cwd());
    }
};

module.exports = getProjectConfiguration;
