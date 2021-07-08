const { removeCacheFolder } = require('./cache');
const { stopServices } = require('./docker');
const { removeVolumes } = require('./docker/volumes');
const {
    uninstallMagento,
    removeMagento
} = require('./magento');
const getMagentoVersionConfig = require('../config/get-project-configuration');
const { stopPhpFpm } = require('./php-fpm');
const getProjectConfiguration = require('../config/get-config-from-config-file');
const checkConfigurationFile = require('../config/check-configuration-file');

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const cleanup = {
    title: 'Cleanup project',
    task: async (ctx, task) => task.newListr([
        getMagentoVersionConfig,
        checkConfigurationFile,
        getProjectConfiguration,
        stopPhpFpm,
        stopServices,
        removeVolumes,
        removeCacheFolder,
        uninstallMagento,
        removeMagento
    ], {
        concurrent: false,
        exitOnError: true
    })
};

module.exports = cleanup;
