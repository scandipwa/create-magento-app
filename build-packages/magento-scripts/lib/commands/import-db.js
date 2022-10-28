const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const { Listr } = require('listr2')
const importDump = require('../tasks/import-dump')

/**
 * @param {import('yargs')} yargs
 */
module.exports = (yargs) => {
    yargs.command(
        'import-db [importDb]',
        'Import database dump to MariaDB',
        (yargs) => {
            yargs.option('remote-db', {
                alias: 'r',
                describe: 'Import database from remote ssh server',
                type: 'string'
            })
            yargs.option('with-customers-data', {
                describe: 'Include orders and customers data in database dump',
                type: 'boolean',
                default: false
            })
            yargs.option('no-compress', {
                describe: 'Do not compress remote dump files',
                type: 'boolean',
                default: false
            })
        },
        async (args) => {
            const tasks = new Listr(importDump(), {
                exitOnError: true,
                ctx: args,
                concurrent: false,
                rendererOptions: {
                    showErrorMessage: false,
                    showTimer: true
                }
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
