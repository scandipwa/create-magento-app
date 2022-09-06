const { Listr } = require('listr2');
const cli = require('../tasks/cli');
const createBashrcConfigFile = require('../tasks/cli/create-bashrc-config');
const getMagentoVersionConfig = require('../config/get-magento-version-config');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const getProjectConfiguration = require('../config/get-project-configuration');
const checkConfigurationFile = require('../config/check-configuration-file');
// const { installComposer, installPrestissimo } = require('../tasks/composer');
const ConsoleBlock = require('../util/console-block');
const { checkComposerCredentials } = require('../tasks/requirements/composer-credentials');

/**
 * @param {import('yargs')} yargs
 */
module.exports = (yargs) => {
    yargs.command('cli', 'Enter CLI (magento, php, composer).', () => {}, async () => {
        const tasks = new Listr([
            getMagentoVersionConfig(),
            checkConfigurationFile(),
            getProjectConfiguration(),
            createBashrcConfigFile(),
            checkComposerCredentials()
        ], {
            concurrent: false,
            exitOnError: true,
            ctx: {
                throwMagentoVersionMissing: true
            },
            rendererOptions: { collapse: false, clearOutput: true }
        });

        let ctx;
        try {
            ctx = await tasks.run();
        } catch (e) {
            logger.error(e.message || e);
            process.exit(1);
        }

        const block = new ConsoleBlock();

        block
            .addHeader('Create Magento App CLI')
            .addEmptyLine()
            .addLine(`Available aliases: ${logger.style.command('php')}, ${logger.style.command('magento')}, ${logger.style.command('composer')}`)
            .addLine(`Available shortcuts: magento -> ${logger.style.command('m')}, composer -> ${logger.style.command('c')}`)
            .addEmptyLine();

        block
            .addLine(`Execute into any service: ${logger.style.command('exec <service name>')}`)
            .addLine(`Execute into PHP container: ${logger.style.command('exec php')}`)
            .addEmptyLine();

        if (ctx.config.overridenConfiguration.configuration.varnish.enabled) {
            block.addLine(`Clear Varnish cache: ${logger.style.command('cvc')}`);
        }

        block
            .addLine(`Clear Magento cache: ${logger.style.command('m c:c')}`)
            .addLine(`Magento setup upgrade: ${logger.style.command('m se:up')}`)
            .addLine(`Magento DI compile: ${logger.style.command('m s:d:c')}`)
            .addEmptyLine();

        block
            .addLine(`Clear Composer cache: ${logger.style.command('c cc')}`)
            .addEmptyLine();

        block
            .addLine(`Connect to MariaDB server: ${logger.style.command('mariadb')}`)
            .addLine(`Connect to MariaDB server as root: ${logger.style.command('mariadbroot')}`)
            .addEmptyLine();

        block.log();

        return cli();
    });
};
