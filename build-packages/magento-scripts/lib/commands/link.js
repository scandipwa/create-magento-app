const logger = require('@scandipwa/common-dev-utils/logger');
const { Listr } = require('listr2');
const { linkTheme } = require('../tasks/theme');

module.exports = (yargs) => {
    yargs.command('link <theme path>', 'Link with ScandiPWA application.', () => {}, async (args) => {
        const tasks = new Listr([
            linkTheme
        ], {
            concurrent: false,
            exitOnError: true,
            ctx: { throwMagentoVersionMissing: true, ...args },
            rendererOptions: { collapse: false }
        });

        try {
            await tasks.run();
            process.exit(0);
        } catch (e) {
            logger.error(e.message || e);
            process.exit(1);
        }
    });
};
