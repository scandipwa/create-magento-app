const { Listr } = require('listr2')
const stop = require('../tasks/stop')

/**
 * @param {import('yargs')} yargs
 */
module.exports = (yargs) => {
    yargs.command(
        'stop',
        'Stop the application.',
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {},
        async (args) => {
            const silent = /** @type {boolean} */ (args.silent)
            const tasks = new Listr(stop(), {
                concurrent: false,
                exitOnError: true,
                ctx: {
                    throwMagentoVersionMissing: true,
                    projectPath: process.cwd(),
                    silent
                },
                renderer:
                    silent || !process.stdout.isTTY ? 'silent' : 'default',
                rendererOptions: {
                    collapse: false
                }
            })

            await tasks.run()
        }
    )
}
