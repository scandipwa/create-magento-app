const { checkRequirements } = require('./requirements');
const {
    importDumpToMySQL,
    fixDB,
    dumpThemeConfig,
    restoreThemeConfig
} = require('./mysql');
const { setupMagento } = require('./magento');
const indexProducts = require('./magento/setup-magento/index-products');
const {
    retrieveProjectConfiguration,
    stopProject,
    retrieveFreshProjectConfiguration,
    configureProject
} = require('./start');
const importRemoteDb = require('./mysql/import-remote-db');

/**
 * @type {() => import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const importDump = () => ({
    title: 'Importing Database Dump',
    task: (ctx, task) => task.newListr([
        importRemoteDb(),
        checkRequirements(),
        retrieveProjectConfiguration(),
        stopProject(),
        retrieveFreshProjectConfiguration(),
        configureProject(),
        dumpThemeConfig(),
        importDumpToMySQL(),
        restoreThemeConfig(),
        fixDB(),
        setupMagento(),
        indexProducts()
    ], {
        concurrent: false,
        exitOnError: true,
        rendererOptions: {
            collapse: false
        }
    })
});

module.exports = importDump;
