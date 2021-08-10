const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { Listr } = require('listr2');
const getMagentoVersionConfig = require('../config/get-magento-version-config');
const { getCachedPorts } = require('../config/get-port-config');

const { prettyStatus } = require('../tasks/status');
const { checkRequirements } = require('../tasks/requirements');
const { statusContainers } = require('../tasks/docker/containers');
const getProjectConfiguration = require('../config/get-project-configuration');
const checkConfigurationFile = require('../config/check-configuration-file');

/**
 * @param {import('yargs')} yargs
 */
module.exports = (yargs) => {
    yargs.command('status', 'Show application status', () => {}, async (args) => {
        const tasks = new Listr([
            checkRequirements(),
            getMagentoVersionConfig(),
            checkConfigurationFile(),
            getProjectConfiguration(),
            getCachedPorts(),
            statusContainers()
        ], {
            concurrent: false,
            exitOnError: true,
            ctx: { throwMagentoVersionMissing: true, ...args },
            rendererOptions: { collapse: false, clearOutput: true }
        });

        try {
            prettyStatus(await tasks.run());
        } catch (e) {
            logger.error(e.message || e);
            process.exit(1);
        }
        process.exit(0);
    });
};
