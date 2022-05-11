const { Listr } = require('listr2');
const cli = require('../tasks/cli');
const createBashrcConfigFile = require('../tasks/cli/create-bashrc-config');
const getMagentoVersionConfig = require('../config/get-magento-version-config');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const getProjectConfiguration = require('../config/get-project-configuration');
const localAuthJson = require('../tasks/composer/local-auth-json');
const checkConfigurationFile = require('../config/check-configuration-file');
const { installComposer, installPrestissimo } = require('../tasks/composer');
const ConsoleBlock = require('../util/console-block');

/**
 * @param {import('yargs')} yargs
 */
module.exports = (yargs) => {
    yargs.command('cli', 'Enter CLI (magento, php, composer).', () => {}, async () => {
        const tasks = new Listr([
            getMagentoVersionConfig(),
            checkConfigurationFile(),
            getProjectConfiguration(),
            installComposer(),
            installPrestissimo(),
            createBashrcConfigFile(),
            localAuthJson()
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

        if (ctx.config.overridenConfiguration.configuration.varnish.enabled) {
            block.addLine(`Clear Varnish cache: ${logger.style.command('cvc')}`);
        }

        block
            .addLine(`Clear Composer cache: ${logger.style.command('c cc')}`)
            .addLine(`Clear Magento cache: ${logger.style.command('m c:c')}`)
            .addLine(`Magento setup upgrade: ${logger.style.command('m se:up')}`)
            .addLine(`Magento DI compile: ${logger.style.command('m s:d:c')}`);

        block.addEmptyLine();

        block.log();

        return cli();
    });
};
