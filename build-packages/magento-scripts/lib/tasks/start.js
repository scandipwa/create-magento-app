/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
const openBrowser = require('../util/open-browser');

const getMagentoVersionConfig = require('../config/get-magento-version-config');
const { saveConfiguration } = require('../config/save-config');
const { getAvailablePorts, getCachedPorts } = require('../config/get-port-config');
const { installComposer, installPrestissimo } = require('./composer');
const { startServices, stopServices } = require('./docker');
const { installPhp, configurePhp } = require('./php');
const { checkRequirements } = require('./requirements');
const { createCacheFolder } = require('./cache');
const { startPhpFpm, stopPhpFpm } = require('./php-fpm');
const { prepareFileSystem } = require('./file-system');
const { installMagento, setupMagento } = require('./magento');
const { pullContainers } = require('./docker/containers');
const { setPrefix } = require('./prefix');
const {
    connectToMySQL,
    importDumpToMySQL,
    fixDB,
    restoreThemeConfig
} = require('./mysql');
const getConfigFromConfigFile = require('../config/get-config-from-config-file');
const { getSystemConfig } = require('../config/system-config');

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const start = {
    title: 'Starting project',
    task: async (ctx, task) => task.newListr([
        createCacheFolder,
        checkRequirements,
        getMagentoVersionConfig,
        getConfigFromConfigFile,
        getSystemConfig,
        getCachedPorts,
        stopServices,
        stopPhpFpm,
        setPrefix,
        getConfigFromConfigFile,
        // get fresh ports
        getAvailablePorts,
        saveConfiguration,
        // first install php is used to build php if it's missing
        installPhp,
        {
            title: 'Install Composer, prepare FS & download images',
            task: (ctx, task) => task.newListr([
                installComposer,
                prepareFileSystem,
                pullContainers
            ], {
                concurrent: true,
                exitOnError: true,
                ctx
            })
        },
        // second is needed to check if php have missing extensions
        configurePhp,
        installPrestissimo,
        installMagento,
        startServices,
        connectToMySQL,
        setupMagento,
        {
            task: (ctx, task) => {
                if (ctx.importDb) {
                    return task.newListr([
                        restoreThemeConfig,
                        importDumpToMySQL,
                        fixDB,
                        restoreThemeConfig,
                        setupMagento
                    ], {
                        concurrent: false,
                        exitOnError: true,
                        ctx,
                        rendererOptions: { collapse: false }
                    });
                }
            }
        },
        startPhpFpm,
        {
            title: 'Opening browser',
            task: ({ ports, noOpen, config: { overridenConfiguration: { host, ssl } } }, task) => {
                if (noOpen) {
                    task.skip();
                    return;
                }
                openBrowser(`${ssl.enabled ? 'https' : 'http'}://${host}${ports.app === 80 ? '' : `:${ports.app}`}/`);
            }
        },
        {
            task: (ctx) => ctx.mysqlConnection.destroy()
        }
    ], {
        concurrent: false,
        exitOnError: true,
        ctx,
        rendererOptions: { collapse: false }
    })
};

module.exports = start;
