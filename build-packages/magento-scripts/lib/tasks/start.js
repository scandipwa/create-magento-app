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
    restoreThemeConfig,
    dumpThemeConfig
} = require('./mysql');
const getProjectConfiguration = require('../config/get-project-configuration');
const { getSystemConfigTask } = require('../config/system-config');
const setupThemes = require('./theme/setup-themes');
const pkg = require('../../package.json');
const checkConfigurationFile = require('../config/check-configuration-file');
const convertLegacyVolumes = require('./docker/convert-legacy-volumes');

/**
 * @type {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const retrieveProjectConfiguration = {
    title: 'Retrieving project configuration',
    task: (ctx, task) => task.newListr([
        getMagentoVersionConfig,
        checkConfigurationFile,
        getProjectConfiguration,
        convertLegacyVolumes,
        createCacheFolder,
        getSystemConfigTask,
        getCachedPorts
    ], {
        rendererOptions: {
            collapse: true
        }
    }),
    options: {
        showTimer: false
    }
};

/**
 * @type {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const stopProject = {
    title: 'Stopping project',
    task: (ctx, task) => task.newListr([
        stopServices,
        stopPhpFpm
    ], {
        concurrent: true,
        rendererOptions: {
            collapse: true,
            showTimer: false
        }
    }),
    options: {
        showTimer: false
    }
};

/**
 * @type {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const retrieveFreshProjectConfiguration = {
    title: 'Retrieving fresh project configuration',
    task: (ctx, task) => task.newListr([
        setPrefix,
        getProjectConfiguration,
        // get fresh ports
        getAvailablePorts,
        saveConfiguration
    ], {
        rendererOptions: {
            collapse: true
        }
    }),
    options: {
        showTimer: false
    }
};

/**
 * @type {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const configureProject = {
    title: 'Configuring project',
    task: (ctx, task) => task.newListr([
        installPhp,
        {
            // title: 'Installing Composer, preparing filesystem and downloading container images',
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
};

/**
 * @type {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const finishProjectConfiguration = {
    title: 'Finishing project configuration',
    task: (ctx, task) => task.newListr([
        {
            skip: (ctx) => !ctx.importDb,
            task: (ctx, task) => {
                task.title = 'Importing database dump';
                return task.newListr([
                    dumpThemeConfig,
                    importDumpToMySQL,
                    fixDB,
                    restoreThemeConfig,
                    setupMagento
                ], {
                    concurrent: false,
                    exitOnError: true
                });
            }
        },
        {
            title: 'Setting up themes',
            skip: (ctx) => !ctx.magentoFirstInstall,
            task: (subCtx, subTask) => subTask.newListr([
                setupThemes
            ])
        }
    ], {
        rendererOptions: {
            collapse: true
        }
    })
};

/**
 * @type {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const start = {
    title: 'Starting project',
    task: (ctx, task) => {
        task.title = `Starting project (magento-scripts@${pkg.version})`;
        return task.newListr([
            checkRequirements,
            retrieveProjectConfiguration,
            stopProject,
            retrieveFreshProjectConfiguration,
            configureProject,
            setupMagento,
            finishProjectConfiguration,
            {
                title: 'Opening browser',
                skip: (ctx) => ctx.noOpen,
                task: ({ ports, config: { overridenConfiguration: { host, ssl } } }) => {
                    openBrowser(`${ssl.enabled ? 'https' : 'http'}://${host}${ports.app === 80 ? '' : `:${ports.app}`}/`);
                },
                options: {
                    showTimer: false
                }
            },
            {
                task: (ctx) => ctx.mysqlConnection.destroy()
            }
        ], {
            concurrent: false,
            exitOnError: true,
            rendererOptions: {
                collapse: false
            }
        });
    }
};

module.exports = {
    start,
    retrieveProjectConfiguration,
    retrieveFreshProjectConfiguration,
    stopProject,
    configureProject,
    finishProjectConfiguration
};
