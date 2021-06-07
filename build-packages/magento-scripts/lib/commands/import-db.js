/* eslint-disable no-param-reassign */
// const path = require('path');
const logger = require('@scandipwa/common-dev-utils/logger');
const { Listr } = require('listr2');
const importDump = require('../tasks/import-dump');

module.exports = (yargs) => {
    yargs.command(
        'import-db <importDb>',
        'Import database dump to MySQL',
        () => {},
        async (args = {}) => {
            const tasks = new Listr([importDump], {
                exitOnError: true,
                ctx: args,
                concurrent: false,
                rendererOptions: { collapse: false }
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
