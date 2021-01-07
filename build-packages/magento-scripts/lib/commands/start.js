/* eslint-disable no-param-reassign */
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { Listr } = require('listr2');
const start = require('../tasks/start');

module.exports = (yargs) => {
    yargs.command('start', 'Deploy the application.', (yargs) => {
        yargs.option(
            'port',
            {
                alias: 'p',
                describe: 'Suggest a port for an application to run.',
                type: 'number',
                nargs: 1
            }
        );

        yargs.option(
            'no-open',
            {
                alias: 'n',
                describe: 'Do not open browser after command finished',
                type: 'boolean',
                default: false
            }
        );

        yargs.option(
            'debug',
            {
                alias: 'd',
                describe: 'Enable PHP xdebug.',
                type: 'boolean',
                default: false
            }
        );

        yargs.option(
            'skip-setup', {
                alias: 's',
                describe: 'Skip Magento setup',
                type: 'boolean',
                default: false
            }
        );
    }, async (args = {}) => {
        const tasks = new Listr([start], {
            exitOnError: true,
            ctx: { force: args.testRun, ...args },
            concurrent: false,
            rendererOptions: { collapse: false }
        });

        if (args.debug) {
            logger.warn('You are running in debug mode. Magento setup will be slow.');
        }

        try {
            const { ports, magentoConfig } = await tasks.run();

            logger.logN();
            logger.log(`Web location: ${logger.style.link(`http://localhost:${ports.app}/`)}`);
            logger.log(`Magento Admin panel location: ${logger.style.link(`http://localhost:${ports.app}/${magentoConfig.adminuri}`)}`);
            logger.logN(`Magento Admin panel credentials: ${logger.style.misc(magentoConfig.user)} - ${logger.style.misc(magentoConfig.password)}`);
            process.exit(0);
        } catch (e) {
            logger.error(e.message || e);
            process.exit(1);
        }
    });
};
