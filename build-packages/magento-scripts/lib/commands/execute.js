const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { Listr } = require('listr2');
const checkConfigurationFile = require('../config/check-configuration-file');
const getProjectConfiguration = require('../config/get-project-configuration');
const executeInContainer = require('../tasks/execute');
const getMagentoVersionConfig = require('../config/get-magento-version-config');
const { checkRequirements } = require('../tasks/requirements');
const { getCachedPorts } = require('../config/get-port-config');
const { executeTask } = require('../tasks/execute');

/**
 * @param {import('yargs')} yargs
 */
module.exports = (yargs) => {
    yargs.command(
        'exec <container name> [commands...]',
        'Execute command in docker container',
        (yargs) => {
            yargs.usage(`Usage: npm run exec <container name> [commands...]

Available containers:
- mariadb
- nginx
- redis
- elasticsearch
- varnish (if enabled)
- sslTerminator`);
        },
        async (argv) => {
            await executeTask(argv);
        }
    );
};
