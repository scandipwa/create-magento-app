/* eslint-disable no-param-reassign */
const { checkRequirements } = require('./requirements');
const {
    importDumpToMySQL,
    fixDB,
    dumpThemeConfig,
    restoreThemeConfig
} = require('./mysql');
const { setupMagento } = require('./magento');
const {
    retrieveProjectConfiguration,
    stopProject,
    retrieveFreshProjectConfiguration,
    configureProject
} = require('./start');
const importRemoteDbSSH = require('./mysql/import-remote-db');

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const importDump = {
    title: 'Importing Database Dump',
    task: (ctx, task) => {
        task.title = `Importing database dump '${ctx.importDb}'`;
        return task.newListr([
            importRemoteDbSSH,
            checkRequirements,
            retrieveProjectConfiguration,
            stopProject,
            retrieveFreshProjectConfiguration,
            configureProject,
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
};

module.exports = importDump;
