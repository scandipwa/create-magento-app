/* eslint-disable no-param-reassign */
// const path = require('path');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { Listr } = require('listr2');
const importDump = require('../tasks/import-dump');

/**
 * @param {import('yargs')} yargs
 */
module.exports = (yargs) => {
    yargs.command(
        'import-db [importDb]',
        'Import database dump to MySQL',
        (yargs) => {
            yargs.option('remote-db', {
                describe: 'Import database from remote ssh server',
                type: 'string'
            });

            yargs.option('private-key', {
                describe: 'Private key location for SSH connection',
                type: 'string'
            });
        },
        async (args = {}) => {
            const tasks = new Listr([importDump], {
                exitOnError: true,
                ctx: args,
                concurrent: false,
                rendererOptions: {
                    showErrorMessage: false,
                    showTimer: true
                }
            });

            try {
                await tasks.run();

                process.exit(0);
            } catch (e) {
                logger.error(e.message || e);
                process.exit(1);
            }
        }
    );
};
