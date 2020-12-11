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
    }, async (args = {}) => {
        const tasks = new Listr([start], {
            exitOnError: true,
            ctx: { force: args.testRun, ...args },
            concurrent: false,
            rendererOptions: { collapse: false }
        });

        try {
            await tasks.run();
            process.exit(0);
        } catch (e) {
            logger.error(e.message);
            process.exit(1);
        }
    });
};
