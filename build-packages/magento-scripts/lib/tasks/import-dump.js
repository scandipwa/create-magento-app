/* eslint-disable no-param-reassign */
const getMagentoVersionConfig = require('../config/get-magento-version-config');
const { getCachedPorts } = require('../config/get-port-config');
const { checkRequirements } = require('./requirements');
const {
    importDumpToMySQL,
    fixDB,
    connectToMySQL,
    dumpThemeConfig,
    restoreThemeConfig
} = require('./mysql');
const { setupMagento } = require('./magento');

const importDump = {
    title: 'Importing Database Dump',
    task: (ctx, task) => {
        task.title = `Importing database dump '${ctx.importDb}'`;
        return task.newListr([
            checkRequirements,
            getMagentoVersionConfig,
            getCachedPorts,
            connectToMySQL,
            dumpThemeConfig,
            importDumpToMySQL,
            fixDB,
            restoreThemeConfig,
            setupMagento
        ], {
            concurrent: false,
            exitOnError: true,
            ctx,
            rendererOptions: { collapse: false }
        });
    }
};

module.exports = importDump;
