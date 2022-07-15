const { stopServices } = require('./docker');
const getMagentoVersionConfig = require('../config/get-magento-version-config');
// const { stopPhpFpm } = require('./php-fpm');
const getProjectConfiguration = require('../config/get-project-configuration');
const checkConfigurationFile = require('../config/check-configuration-file');

/**
 * @type {() => import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const stop = () => ({
    title: 'Stopping project',
    task: async (ctx, task) => task.newListr([
        getMagentoVersionConfig(),
        checkConfigurationFile(),
        getProjectConfiguration(),
        // stopPhpFpm(),
        stopServices()
    ], {
        concurrent: false,
        exitOnError: true
    })
});

module.exports = stop;
