const { removeCacheFolder } = require('./cache')
const { stopServices } = require('./docker')
const { removeVolumes } = require('./docker/volume/tasks')
const { uninstallMagento, removeMagento } = require('./magento')
const getMagentoVersionConfig = require('../config/get-magento-version-config')
// const { stopPhpFpm } = require('./php-fpm');
const getProjectConfiguration = require('../config/get-project-configuration')
const checkConfigurationFile = require('../config/check-configuration-file')

/**
 * @returns {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const cleanup = () => ({
    title: 'Cleanup project',
    task: (ctx, task) =>
        task.newListr([
            checkConfigurationFile(),
            getMagentoVersionConfig(),
            getProjectConfiguration(),
            // stopPhpFpm(),
            stopServices(),
            removeVolumes(),
            removeCacheFolder(),
            uninstallMagento(),
            removeMagento()
        ])
})

module.exports = cleanup
