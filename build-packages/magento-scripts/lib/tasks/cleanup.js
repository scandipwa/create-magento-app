const { removeCacheFolder } = require('./cache');
const { stopServices } = require('./docker');
const { removeVolumes } = require('./docker/volumes');
const {
    uninstallMagento,
    removeMagento
} = require('./magento');
const getMagentoVersionConfig = require('../config/get-magento-version-config');
const { stopPhpFpm } = require('./php-fpm');
const getConfigFromConfigFile = require('../config/get-config-from-config-file');

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const cleanup = {
    title: 'Cleanup project',
    task: async (ctx, task) => task.newListr([
        getMagentoVersionConfig,
        getConfigFromConfigFile,
        stopPhpFpm,
        stopServices,
        removeVolumes,
        removeCacheFolder,
        uninstallMagento,
        removeMagento
    ], {
        concurrent: false,
        exitOnError: true,
        ctx,
        rendererOptions: { collapse: false }
    })
};

module.exports = cleanup;
