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
const setupThemes = require('./theme/setup-themes');

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const start = {
    title: 'Starting project',
    task: async (ctx, task) => task.newListr([
        checkRequirements,
        {
            title: 'Retrieving project configuration',
            task: (ctx, task) => task.newListr([
                getMagentoVersionConfig,
                getConfigFromConfigFile,
                createCacheFolder,
                getSystemConfig,
                getCachedPorts
            ])
        },
        {
            title: 'Stopping project',
            task: (ctx, task) => task.newListr([
                stopServices,
                stopPhpFpm
            ], {
                concurrent: true
            })
        },
        setPrefix,
        {
            title: 'Retrieving fresh project configuration',
            task: (ctx, task) => task.newListr([
                getConfigFromConfigFile,
                // get fresh ports
                getAvailablePorts,
                saveConfiguration
            ])
        },
        {
            title: 'Installing PHP',
            task: (ctx, task) => task.newListr([
                installPhp
            ])
        },
        {
            title: 'Configuring project',
            task: (ctx, task) => task.newListr([
                {
                    title: 'Installing Composer, preparing filesystem and downloading container images',
                    task: (ctx, task) => task.newListr([
                        installComposer,
                        prepareFileSystem,
                        pullContainers
                    ], {
                        concurrent: true,
                        exitOnError: true
                    })
                },
                configurePhp,
                installPrestissimo,
                installMagento,
                startServices,
                startPhpFpm,
                connectToMySQL
            ])
        },
        setupMagento,
        {
            title: 'Finishing project configuration',
            task: (ctx, task) => task.newListr([
                {
                    skip: (ctx) => !ctx.importDb,
                    task: (ctx, task) => {
                        task.title = 'Importing database dump';
                        return task.newListr([
                            restoreThemeConfig,
                            importDumpToMySQL,
                            fixDB,
                            restoreThemeConfig,
                            setupMagento
                        ], {
                            concurrent: false,
                            exitOnError: true,
                            rendererOptions: { collapse: true }
                        });
                    }
                },
                {
                    title: 'Setup themes',
                    skip: (ctx) => !ctx.magentoFirstInstall,
                    task: (subCtx, subTask) => subTask.newListr([
                        setupThemes
                    ])
                }
            ])
        },
        {
            title: 'Opening browser',
            skip: (ctx) => ctx.noOpen,
            task: ({ ports, config: { overridenConfiguration: { host, ssl } } }) => {
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
