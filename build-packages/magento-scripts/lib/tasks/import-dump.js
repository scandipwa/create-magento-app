/* eslint-disable no-param-reassign */
const getMagentoVersionConfig = require('../config/get-magento-version-config');
const { getCachedPorts } = require('../config/get-port-config');
const { checkRequirements } = require('./requirements');
const { importDumpToMySQL, fixDB } = require('./mysql');

const importDump = {
    title: 'Importing Database Dump',
    task: (ctx, task) => {
        task.title = `Importing database dump '${ctx.importDb}'`;
        return task.newListr([
            checkRequirements,
            getMagentoVersionConfig,
            getCachedPorts,
            importDumpToMySQL,
            fixDB
        ], {
            concurrent: false,
            exitOnError: true,
            ctx,
            rendererOptions: { collapse: false }
        });
    }
};

module.exports = importDump;
