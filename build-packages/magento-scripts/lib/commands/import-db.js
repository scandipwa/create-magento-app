/* eslint-disable no-param-reassign */
// const path = require('path');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
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

                logger.logN();
                logger.warn(`If you had theme setup you might want to re-link theme by running command ${ logger.style.command('link') }!`);
                logger.warn(`Also, it's recommended to run ${ logger.style.command('start') } properly configure setup!`);
                process.exit(0);
            } catch (e) {
                logger.error(e.message || e);
                process.exit(1);
            }
        }
    );
};
