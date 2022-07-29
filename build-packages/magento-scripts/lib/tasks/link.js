const getMagentoVersionConfig = require('../config/get-magento-version-config');
const { getCachedPorts } = require('../config/get-port-config');
const getProjectConfiguration = require('../config/get-project-configuration');
const retrieveThemeData = require('./theme/retrieve-theme-data');
const linkTheme = require('./theme/link-theme');
const { startServices } = require('./docker');
const checkConfigurationFile = require('../config/check-configuration-file');
const { connectToMySQL } = require('./mysql');
const { checkRequirements } = require('./requirements');

/**
 * @type {(theme: string) => import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const linkTask = (themePath) => ({
    task: (ctx, task) => task.newListr([
        checkRequirements(),
        getMagentoVersionConfig(),
        checkConfigurationFile(),
        getProjectConfiguration(),
        getCachedPorts(),
        startServices(),
        // startPhpFpm(),
        connectToMySQL(),
        retrieveThemeData(themePath),
        linkTheme()
    ])
});

module.exports = linkTask;
