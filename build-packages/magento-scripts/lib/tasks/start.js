const openBrowser = require('../util/open-browser')

const getMagentoVersionConfig = require('../config/get-magento-version-config')
const { saveConfiguration } = require('../config/save-config')
const {
    getAvailablePorts,
    getCachedPorts
} = require('../config/get-port-config')
const { getComposerVersionTask } = require('./composer')
const { startServices } = require('./docker')
const { checkRequirements } = require('./requirements')
const { createCacheFolder } = require('./cache')
const { prepareFileSystem } = require('./file-system')
const { installMagentoProject, setupMagento } = require('./magento')
const { pullImages, stopContainers } = require('./docker/containers')
const dockerNetwork = require('./docker/network')
const { connectToDatabase } = require('./database')
const { buildProjectImage } = require('./docker/project-image-builder')
const getProjectConfiguration = require('../config/get-project-configuration')
const { getSystemConfigTask } = require('../config/system-config')
const setupThemes = require('./theme/setup-themes')
const pkg = require('../../package.json')
const checkConfigurationFile = require('../config/check-configuration-file')
const convertLegacyVolumes = require('./docker/convert-legacy-volumes')
const enableMagentoComposerPlugins = require('./magento/enable-magento-composer-plugins')
const getIsWsl = require('../util/is-wsl')
const checkForXDGOpen = require('../util/xdg-open-exists')
const {
    getInstanceMetadata,
    constants: { WEB_LOCATION_TITLE }
} = require('../util/instance-metadata')
const waitingForVarnish = require('./magento/setup-magento/waiting-for-varnish')
const checkPHPVersion = require('./requirements/php-version')
const volumes = require('./docker/volume/tasks')
const convertMySQLDatabaseToMariaDB = require('./docker/convert-mysql-to-mariadb')
const { cmaGlobalConfig } = require('../config/cma-config')
const { setProjectConfigTask } = require('./project-config')
const {
    convertComposerHomeToComposerCacheVolume
} = require('./docker/convert-composer-home-to-composer-cache-volume')

/**
 * @returns {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const resetCmaGlobalConfig = () => ({
    skip: (ctx) => !ctx.resetGlobalConfig,
    task: () => {
        cmaGlobalConfig.clear()
    }
})

/**
 * @returns {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const retrieveProjectConfiguration = () => ({
    title: 'Retrieving project configuration',
    task: (ctx, task) =>
        task.newListr(
            [
                getMagentoVersionConfig(),
                checkConfigurationFile(),
                getProjectConfiguration(),
                convertLegacyVolumes(),
                createCacheFolder(),
                getSystemConfigTask(),
                getCachedPorts()
            ],
            {
                rendererOptions: {
                    collapse: true
                }
            }
        ),
    options: {
        showTimer: false
    }
})

/**
 * @returns {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const stopProject = () => ({
    title: 'Stopping project',
    task: (ctx, task) =>
        task.newListr([stopContainers(), volumes.removeLocalVolumes()]),
    options: {
        showTimer: false
    }
})

/**
 * @returns {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const retrieveFreshProjectConfiguration = () => ({
    title: 'Retrieving fresh project configuration',
    task: (ctx, task) =>
        task.newListr(
            [
                setProjectConfigTask(),
                getProjectConfiguration(),
                // get fresh ports
                getAvailablePorts(),
                saveConfiguration()
            ],
            {
                rendererOptions: {
                    collapse: true
                }
            }
        ),
    options: {
        showTimer: false
    }
})

/**
 * @returns {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const configureProject = () => ({
    title: 'Configuring project',
    task: (ctx, task) =>
        task.newListr([
            convertMySQLDatabaseToMariaDB(),
            {
                task: (ctx, subTask) =>
                    subTask.newListr(
                        [pullImages(), dockerNetwork.tasks.createNetwork()],
                        { concurrent: true }
                    )
            },
            checkPHPVersion(),
            buildProjectImage(),
            getComposerVersionTask(),
            prepareFileSystem(),
            volumes.createVolumes(),
            convertComposerHomeToComposerCacheVolume(),
            installMagentoProject(),
            enableMagentoComposerPlugins(),
            startServices(),
            connectToDatabase()
        ])
})

/**
 * @returns {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const finishProjectConfiguration = () => ({
    title: 'Finishing project configuration',
    skip: ({ skipSetup }) => Boolean(skipSetup),
    task: (ctx, task) =>
        task.newListr([setupThemes(), waitingForVarnish()], {
            rendererOptions: {
                collapse: false
            }
        })
})

/**
 * @returns {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const start = () => ({
    title: 'Starting project',
    task: (ctx, task) => {
        task.title = `Starting project (magento-scripts@${pkg.version})`
        return task.newListr(
            [
                resetCmaGlobalConfig(),
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
                            return true
                        }

                        if (await getIsWsl()) {
                            const canOpenBrowser = await checkForXDGOpen()

                            if (!canOpenBrowser) {
                                return 'Cannot open the browser, xdg-open is not available.'
                            }
                        }

                        return false
                    },
                    task: (ctx) => {
                        const instanceMetadata = getInstanceMetadata(ctx)
                        const locationOnTheWeb = instanceMetadata.frontend.find(
                            ({ title }) => title === WEB_LOCATION_TITLE
                        )
                        if (locationOnTheWeb) {
                            openBrowser(locationOnTheWeb.text)
                        }
                    },
                    options: {
                        showTimer: false
                    }
                }
            ],
            {
                concurrent: false,
                exitOnError: true,
                rendererOptions: {
                    collapse: false
                }
            }
        )
    }
})

module.exports = {
    start,
    retrieveProjectConfiguration,
    retrieveFreshProjectConfiguration,
    stopProject,
    configureProject,
    finishProjectConfiguration
}
