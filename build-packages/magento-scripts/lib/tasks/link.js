const getMagentoVersionConfig = require('../config/get-magento-version-config');
const { getCachedPorts } = require('../config/get-port-config');
const getConfigFromConfigFile = require('../config/get-config-from-config-file');
const retrieveThemeData = require('./theme/retrieve-theme-data');
const linkTheme = require('./theme/link-theme');
const setupPersistedQuery = require('./theme/setup-persisted-query');
const { startServices } = require('./docker');
const { startPhpFpm } = require('./php-fpm');

/**
 * @type {(theme: string) => import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const linkTask = (themePath) => ({
    task: (ctx, task) => task.newListr([
        getMagentoVersionConfig,
        getConfigFromConfigFile,
        getCachedPorts,
        startServices,
        startPhpFpm,
        retrieveThemeData(themePath),
        linkTheme,
        setupPersistedQuery
    ])
});

module.exports = linkTask;
