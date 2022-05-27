const openBrowser = require('../util/open-browser');

const getMagentoVersionConfig = require('../config/get-magento-version-config');
const { saveConfiguration } = require('../config/save-config');
const { getAvailablePorts, getCachedPorts } = require('../config/get-port-config');
const { installComposer, installPrestissimo } = require('./composer');
const { startServices } = require('./docker');
const { installPhp, configurePhp } = require('./php');
const { checkRequirements } = require('./requirements');
const { createCacheFolder } = require('./cache');
const { startPhpFpm, stopPhpFpm } = require('./php-fpm');
const { prepareFileSystem } = require('./file-system');
const { installMagento, setupMagento } = require('./magento');
const { pullContainers, stopContainers } = require('./docker/containers');
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
const enableMagentoComposerPlugins = require('./magento/enable-magento-composer-plugins');
const getIsWsl = require('../util/is-wsl');
const checkForXDGOpen = require('../util/xdg-open-exists');
const { getInstanceMetadata, constants: { WEB_LOCATION_TITLE } } = require('../util/instance-metadata');
const validatePHPInstallation = require('./php/validate-php');

/**
 * @type {() => import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const retrieveProjectConfiguration = () => ({
    title: 'Retrieving project configuration',
    task: (ctx, task) => task.newListr([
        getMagentoVersionConfig(),
        checkConfigurationFile(),
        getProjectConfiguration(),
        convertLegacyVolumes(),
        createCacheFolder(),
        getSystemConfigTask(),
        getCachedPorts()
    ], {
        rendererOptions: {
            collapse: true
        }
    }),
    options: {
        showTimer: false
    }
});

/**
 * @type {() => import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const stopProject = () => ({
    title: 'Stopping project',
    task: (ctx, task) => task.newListr([
        stopContainers(),
        stopPhpFpm()
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
});

/**
 * @type {() => import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const retrieveFreshProjectConfiguration = () => ({
    title: 'Retrieving fresh project configuration',
    task: (ctx, task) => task.newListr([
        setPrefix(),
        getProjectConfiguration(),
        // get fresh ports
        getAvailablePorts(),
        saveConfiguration()
    ], {
        rendererOptions: {
            collapse: true
        }
    }),
    options: {
        showTimer: false
    }
});

/**
 * @type {() => import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const configureProject = () => ({
    title: 'Configuring project',
    task: (ctx, task) => task.newListr([
        installPhp(),
        installComposer(),
        {
            task: (ctx, task) => task.newListr([
                prepareFileSystem(),
                pullContainers()
            ], {
                concurrent: true,
                exitOnError: true
            })
        },
        configurePhp(),
        validatePHPInstallation(),
        installPrestissimo(),
        installMagento(),
        enableMagentoComposerPlugins(),
        startServices(),
        startPhpFpm(),
        connectToMySQL()
    ])
});

/**
 * @type {() => import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const finishProjectConfiguration = () => ({
    title: 'Finishing project configuration',
    skip: ({ skipSetup }) => skipSetup,
    task: (ctx, task) => task.newListr([
        {
            skip: (ctx) => !ctx.importDb,
            task: (ctx, task) => {
                task.title = 'Importing database dump';
                return task.newListr([
                    dumpThemeConfig(),
                    importDumpToMySQL(),
                    fixDB(),
                    restoreThemeConfig(),
                    setupMagento()
                ], {
                    concurrent: false,
                    exitOnError: true
                });
            }
        },
        setupThemes()
    ], {
        rendererOptions: {
            collapse: false
        }
    })
});

/**
 * @type {() => import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const start = () => ({
    title: 'Starting project',
    task: (ctx, task) => {
        task.title = `Starting project (magento-scripts@${pkg.version})`;
        return task.newListr([
            checkRequirements(),
            retrieveProjectConfiguration(),
            stopProject(),
            retrieveFreshProjectConfiguration(),
            configureProject(),
            setupMagento(),
            finishProjectConfiguration(),
            {
                title: 'Opening browser',
                skip: async (ctx) => {
                    if (ctx.noOpen) {
                        return true;
                    }

                    if (await getIsWsl()) {
                        const canOpenBrowser = await checkForXDGOpen();

                        if (!canOpenBrowser) {
                            return 'Cannot open the browser, xdg-open is not available.';
                        }
                    }

                    return false;
                },
                task: (ctx) => {
                    const instanceMetadata = getInstanceMetadata(ctx);
                    const locationOnTheWeb = instanceMetadata.frontend.find(({ title }) => title === WEB_LOCATION_TITLE);

                    openBrowser(locationOnTheWeb.link);
                },
                options: {
                    showTimer: false
                }
            }
        ], {
            concurrent: false,
            exitOnError: true,
            rendererOptions: {
                collapse: false
            }
        });
    }
});

module.exports = {
    start,
    retrieveProjectConfiguration,
    retrieveFreshProjectConfiguration,
    stopProject,
    configureProject,
    finishProjectConfiguration
};
