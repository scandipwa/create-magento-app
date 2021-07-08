const { Listr } = require('listr2');
const cli = require('../tasks/cli');
const createBashrcConfigFile = require('../tasks/cli/create-bashrc-config');
const getMagentoVersionConfig = require('../config/get-magento-version-config');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const getProjectConfiguration = require('../config/get-config-from-config-file');
const localAuthJson = require('../tasks/composer/local-auth-json');
const checkConfigurationFile = require('../config/check-configuration-file');

/**
 * @param {import('yargs')} yargs
 */
module.exports = (yargs) => {
    yargs.command('cli', 'Enter CLI (magento, php, composer).', () => {}, async () => {
        const tasks = new Listr([
            getMagentoVersionConfig,
            checkConfigurationFile,
            getProjectConfiguration,
            createBashrcConfigFile,
            localAuthJson
        ], {
            concurrent: false,
            exitOnError: true,
            ctx: {},
            rendererOptions: { collapse: false, clearOutput: true }
        });

        try {
            await tasks.run();
        } catch (e) {
            logger.error(e.message || e);
            process.exit(1);
        }

        return cli();
    });
};
