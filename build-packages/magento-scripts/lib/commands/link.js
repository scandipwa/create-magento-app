const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const { Listr } = require('listr2')
const linkTask = require('../tasks/link')

/**
 * @param {import('yargs')} yargs
 */
module.exports = (yargs) => {
    yargs.command(
        'link <theme path>',
        'Link with ScandiPWA application.',
        (yargs) =>
            yargs.option('verbose', {
                alias: 'v',
                describe: 'Enable verbose logging',
                type: 'boolean',
                default: false
            }),
        async (args) => {
            const tasks = new Listr(linkTask(args.themepath), {
                concurrent: false,
                exitOnError: true,
                ctx: { throwMagentoVersionMissing: true },
                rendererOptions: { collapse: false }
            })

            try {
                await tasks.run()
                process.exit(0)
            } catch (e) {
                logger.error(e.message || e)
                process.exit(1)
            }
        }
    )
}
