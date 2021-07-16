/* eslint-disable arrow-body-style */
const path = require('path');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { Listr } = require('listr2');
const { start } = require('../tasks/start');
const pathExists = require('../util/path-exists');
const { baseConfig } = require('../config');
const googleAnalytics = require('@scandipwa/scandipwa-dev-utils/analytics');
const systeminformation = require('systeminformation');

/**
 * @param {import('yargs')} yargs
 */
module.exports = (yargs) => {
    yargs.command('start', 'Deploy the application.', (yargs) => {
        return yargs.option(
            'port',
            {
                alias: 'p',
                describe: 'Suggest a port for an application to run.',
                type: 'number',
                nargs: 1
            }
        ).option(
            'no-open',
            {
                alias: 'n',
                describe: 'Do not open browser after command finished',
                type: 'boolean',
                default: false
            }
        ).option(
            'debug',
            {
                alias: 'd',
                describe: 'Enable PHP xdebug.',
                type: 'boolean',
                default: false
            }
        ).option(
            'skip-setup', {
                alias: 's',
                describe: 'Skip Magento setup',
                type: 'boolean',
                default: false
            }
        )
            .option(
                'import-db', {
                    describe: 'Import database dump to MySQL',
                    type: 'string'
                }
            )
            .option(
                'edition', {
                    alias: 'e',
                    describe: 'Magento Edition to install',
                    type: 'string'
                }
            )
            .option('recompile-php', {
                describe: 'Recompile PHP version used in the project',
                type: 'boolean'
            })
            .option('verbose', {
                alias: 'v',
                describe: 'Enable verbose logging',
                type: 'boolean',
                default: false
            });
    }, async (args = {}) => {
        const tasks = new Listr([start], {
            exitOnError: true,
            ctx: args,
            concurrent: false,
            rendererOptions: {
                showErrorMessage: false,
                showTimer: true
            }
        });
        const timeStamp = Date.now() / 1000;

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
                config: { magentoConfiguration, overridenConfiguration: { host, ssl } },
                systemConfiguration: { analytics }
            } = ctx;

            logger.logN();
            logger.log(`Web location: ${logger.style.link(`${ssl.enabled ? 'https' : 'http'}://${host}${ports.app === 80 ? '' : `:${ports.app}`}/`)}`);
            logger.log(`Magento Admin panel location: ${logger.style.link(`${ssl.enabled ? 'https' : 'http'}://${host}${ports.app === 80 ? '' : `:${ports.app}`}/${magentoConfiguration.adminuri}`)}`);
            logger.logN(`Magento Admin panel credentials: ${logger.style.misc(magentoConfiguration.user)} - ${logger.style.misc(magentoConfiguration.password)}`);
            logger.note(`MySQL credentials, containers status and project information available in ${logger.style.code('npm run status')} command.`);
            logger.log('');

            if (!analytics) {
                process.exit(0);
            }

            try {
                if (!process.isFirstStart) {
                    await googleAnalytics.trackTiming('CMA start time', Date.now() / 1000 - timeStamp);
                    googleAnalytics.printAboutAnalytics();
                    process.exit(0);
                }

                const { manufacturer, brand } = await systeminformation.cpu();
                const { platform, kernel } = await systeminformation.osInfo();
                const { total } = await systeminformation.mem();

                // Get ram amount in MB
                const totalRam = Math.round(total / 1024 / 1024);
                const paramInfo = `Platform: ${platform} ${kernel}, CPU model: ${manufacturer} ${brand}, RAM amount: ${totalRam}MB`;

                await googleAnalytics.trackEvent('Params', paramInfo, 0, 'OS');
                await googleAnalytics.trackTiming('CMA first start time', Date.now() / 1000 - timeStamp);
                googleAnalytics.printAboutAnalytics();
            } catch (e) {
                await googleAnalytics.trackError(e.message || e);
            }

            process.exit(0);
        } catch (e) {
            logger.error(e.message || e);
            await googleAnalytics.trackError(e.message || e);
            process.exit(1);
        }
    });
};
