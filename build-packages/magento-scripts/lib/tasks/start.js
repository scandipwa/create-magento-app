/* eslint-disable no-param-reassign */
const openBrowser = require('../util/open-browser');

const getMagentoVersionConfig = require('../config/get-magento-version-config');
const { saveConfiguration } = require('../config/save-config');
const { getAvailablePorts, getCachedPorts } = require('../config/get-port-config');
const { installComposer, installPrestissimo } = require('./composer');
const { startServices, stopServices } = require('./docker');
const { installPhp } = require('./php');
const { checkRequirements } = require('./requirements');
const { createCacheFolder } = require('./cache');
const { startPhpFpm, stopPhpFpm } = require('./php-fpm');
const { prepareFileSystem } = require('./file-system');
const { installMagento, setupMagento } = require('./magento');
const { pullContainers } = require('./docker/containers');
const { setPrefix } = require('./prefix');
const { connectToMySQL } = require('./mysql');

const start = {
    title: 'Starting project',
    task: async (ctx, task) => task.newListr([
        createCacheFolder,
        checkRequirements,
        getMagentoVersionConfig,
        getCachedPorts,
        stopServices,
        stopPhpFpm,
        setPrefix,
        getMagentoVersionConfig,
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
        // TODO rewrite to 2 separate tasks
        installPhp,
        installPrestissimo,
        installMagento,
        startServices,
        connectToMySQL,
        setupMagento,
        startPhpFpm,
        {
            title: 'Open browser',
            task: async ({ ports, noOpen, config: { overridenConfiguration: { host, ssl } } }, task) => {
                if (noOpen) {
                    task.skip();
                    return;
                }

                openBrowser(`${ssl.enabled ? 'https' : 'http'}://${host}${ports.app === 80 ? '' : `:${ports.app}`}/`);
            }
        },
        {
            task: (ctx) => {
                ctx.mysqlConnection.destroy();
            }
        }
    ], {
        concurrent: false,
        exitOnError: true,
        ctx,
        rendererOptions: { collapse: false }
    })
};

module.exports = start;
