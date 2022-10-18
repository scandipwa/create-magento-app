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
        async () => {
            const tasks = new Listr(stop(), {
                concurrent: false,
                exitOnError: true,
                rendererOptions: {
                    collapse: false
                },
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                ctx: {
                    throwMagentoVersionMissing: true,
                    projectPath: process.cwd()
                }
            })

            await tasks.run()
        }
    )
}
