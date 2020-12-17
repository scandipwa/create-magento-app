const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { Listr } = require('listr2');
const getMagentoVersion = require('../tasks/magento/get-magento-version');
const { getCachedPorts } = require('../util/ports');

const { prettyStatus } = require('../tasks/status');
const { checkRequirements } = require('../tasks/requirements');
const { statusContainers } = require('../tasks/docker/containers');
const getAppConfig = require('../config/get-config');

module.exports = (yargs) => {
    yargs.command('status', 'Show application status', () => {}, async (args) => {
        const tasks = new Listr([
            checkRequirements,
            getAppConfig,
            getMagentoVersion,
            getCachedPorts,
            statusContainers
        ], {
            concurrent: false,
            exitOnError: true,
            ctx: { throwMagentoVersionMissing: true, ...args },
            rendererOptions: { collapse: false, clearOutput: true }
        });

        try {
            prettyStatus(await tasks.run());
            process.exit(0);
        } catch (e) {
            logger.error(e.message || e);
            process.exit(1);
        }
    });
};
