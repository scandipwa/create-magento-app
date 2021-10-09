const path = require('path');
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
const matchFilesystem = require('../util/match-filesystem');

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
        {
            title: 'Installing Magento',
            // skip setup if env.php and config.php are present in app/etc folder
            skip: () => matchFilesystem(path.resolve('app/etc'), ['config.php', 'env.php']),
            task: (subCtx, subTask) => subTask.newListr(
                setupMagento({
                    onlyInstallMagento: true
                })
            )
        },
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
