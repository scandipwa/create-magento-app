/* eslint-disable no-param-reassign */
const path = require('path');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { Listr } = require('listr2');
const start = require('../tasks/start');
const pathExists = require('../util/path-exists');
const { baseConfig } = require('../config');

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

        yargs.option(
            'import-db', {
                describe: 'Import database dump to MySQL',
                type: 'string'
                // normalize: true
            }
        );

        yargs.option(
            'edition', {
                alias: 'e',
                describe: 'Magento Edition to install',
                type: 'string'
            }
        );
    }, async (args = {}) => {
        const tasks = new Listr([start], {
            exitOnError: true,
            ctx: args,
            concurrent: false,
            rendererOptions: { collapse: true }
        });

        if (args.debug) {
            logger.warn('You are running in debug mode. Magento setup will be slow.');
        }
        const legacyMagentoConfigExists = await pathExists(path.join(baseConfig.cacheDir, 'app-config.json'));
        const currentConfigExists = await pathExists(path.join(process.cwd(), 'cma.js'));
        if (legacyMagentoConfigExists && !currentConfigExists) {
            logger.warn('Magento configuration from app-config.json will be moved to cma.js in your projects directory.');
        }

        try {
            const ctx = await tasks.run();

            const {
                ports,
                config: { magentoConfiguration, overridenConfiguration: { host, ssl } }
            } = ctx;

            logger.logN();
            logger.log(`Web location: ${logger.style.link(`${ssl.enabled ? 'https' : 'http'}://${host}${ports.app === 80 ? '' : `:${ports.app}`}/`)}`);
            logger.log(`Magento Admin panel location: ${logger.style.link(`${ssl.enabled ? 'https' : 'http'}://${host}${ports.app === 80 ? '' : `:${ports.app}`}/${magentoConfiguration.adminuri}`)}`);
            logger.logN(`Magento Admin panel credentials: ${logger.style.misc(magentoConfiguration.user)} - ${logger.style.misc(magentoConfiguration.password)}`);
            logger.note(`MySQL credentials, containers status and project information available in ${logger.style.code('npm run status')} command.`);
            logger.log('');
            process.exit(0);
        } catch (e) {
            logger.error(e.message || e);
            process.exit(1);
        }
    });
};
