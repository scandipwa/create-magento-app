const { stopServices } = require('./docker');
const getMagentoVersionConfig = require('../config/get-magento-version-config');
const { stopPhpFpm } = require('./php-fpm');
const getConfigFromConfigFile = require('../config/get-config-from-config-file');

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const stop = {
    title: 'Stopping project',
    task: async (ctx, task) => task.newListr([
        getMagentoVersionConfig,
        getConfigFromConfigFile,
        stopPhpFpm,
        stopServices
    ], {
        concurrent: false,
        exitOnError: true,
        rendererOptions: {
            collapse: false
        },
        ctx
    })
};

module.exports = stop;
