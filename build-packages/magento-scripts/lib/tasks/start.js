/* eslint-disable no-param-reassign */
const { getAvailablePorts, getCachedPorts } = require('../util/ports');
const openBrowser = require('../util/open-browser');

const { installComposer, installPrestissimo } = require('./composer');
const { startServices, stopServices } = require('./docker');
const { installPhp } = require('./php');
const { checkRequirements } = require('./requirements');
const { createCacheFolder } = require('./cache');
const { startPhpFpm, stopPhpFpm } = require('./php-fpm');
const { prepareFileSystem } = require('./file-system');
const { installMagento, setupMagento } = require('./magento');
const getMagentoVersionConfig = require('../config/get-magento-version-config');
const getConfig = require('../config/get-config');
const { pullContainers } = require('./docker/containers');

const start = {
    title: 'Starting project',
    task: async (ctx, task) => task.newListr([
        createCacheFolder,
        checkRequirements,
        getMagentoVersionConfig,
        getConfig,
        getCachedPorts,
        stopServices,
        stopPhpFpm,
        getAvailablePorts,
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
        installPrestissimo,
        installMagento,
        startServices,
        setupMagento,
        startPhpFpm,
        {
            title: 'Open browser',
            task: async ({ ports, noOpen }, task) => {
                if (noOpen) {
                    task.skip();
                    return;
                }

                openBrowser(`http://localhost:${ports.app}`);
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
