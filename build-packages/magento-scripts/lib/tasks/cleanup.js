const { removeCacheFolder } = require('./cache');
const { stopServices } = require('./docker');
const { removeVolumes } = require('./docker/volumes');
const {
    uninstallMagento,
    removeMagento
} = require('./magento');
const { stopPhpFpm } = require('./php-fpm');
const getProjectConfiguration = require('../config/get-project-configuration');
const checkConfigurationFile = require('../config/check-configuration-file');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const cleanup = () => ({
    title: 'Cleanup project',
    task: (ctx, task) => task.newListr([
        checkConfigurationFile(),
        getProjectConfiguration(),
        stopPhpFpm(),
        stopServices(),
        removeVolumes(),
        removeCacheFolder(),
        uninstallMagento(),
        removeMagento()
    ])
});

module.exports = cleanup;
