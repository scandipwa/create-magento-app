const openBrowser = require('../util/open-browser');

const getMagentoVersionConfig = require('../config/get-magento-version-config');
const { saveConfiguration } = require('../config/save-config');
const { getAvailablePorts, getCachedPorts } = require('../config/get-port-config');
const { getComposerVersionTask } = require('./composer');
const { startServices } = require('./docker');
const { checkRequirements } = require('./requirements');
const { createCacheFolder } = require('./cache');
const { prepareFileSystem } = require('./file-system');
const { installMagentoProject, setupMagento } = require('./magento');
const { pullImages, stopContainers } = require('./docker/containers');
const dockerNetwork = require('./docker/network');
const { setPrefix } = require('./prefix');
const { connectToDatabase } = require('./database');
const { buildProjectImage, buildDebugProjectImage } = require('./docker/project-image-builder');
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
const waitingForVarnish = require('./magento/setup-magento/waiting-for-varnish');
const checkPHPVersion = require('./requirements/php-version');
const volumes = require('./docker/volume/tasks');
const convertMySQLDatabaseToMariaDB = require('./docker/convert-mysql-to-mariadb');

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
        stopContainers()
    ]),
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
        convertMySQLDatabaseToMariaDB(),
        pullImages(),
        dockerNetwork.tasks.createNetwork(),
        volumes.createVolumes(),
        {
            task: (ctx, task) => task.newListr([
                buildProjectImage(),
                buildDebugProjectImage()
            ], {
                concurrent: true
            })
        },
        checkPHPVersion(),
        getComposerVersionTask(),
        prepareFileSystem(),
        installMagentoProject(),
        enableMagentoComposerPlugins(),
        startServices(),
        connectToDatabase()
    ])
});

/**
 * @type {() => import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const finishProjectConfiguration = () => ({
    title: 'Finishing project configuration',
    skip: ({ skipSetup }) => skipSetup,
    task: (ctx, task) => task.newListr([
        setupThemes(),
        waitingForVarnish()
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
