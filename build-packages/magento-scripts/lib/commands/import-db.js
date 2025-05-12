const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const { Listr } = require('listr2')
const importDump = require('../tasks/import-dump')
const { getInstanceMetadata } = require('../util/instance-metadata')
const ConsoleBlock = require('../util/console-block')

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

            /**
             * @type {import('../../typings/context').ListrContext}
             */
            let ctx

            try {
                ctx = await tasks.run()
            } catch (e) {
                logger.error(e.message || e)
                process.exit(1)
            }

            const instanceMetadata = getInstanceMetadata(ctx)

            const block = new ConsoleBlock()
            block.addHeader('Magento 2').addEmptyLine()

            block.addLine(logger.style.misc('Frontend'))
            instanceMetadata.frontend.forEach(({ title, text }) => {
                block.addLine(`  ${title}: ${text}`)
            })

            block.addEmptyLine()

            block.addLine(logger.style.misc('Admin'))
            instanceMetadata.admin.forEach(({ title, text }) => {
                block.addLine(`  ${title}: ${text}`)
            })

            block.addEmptyLine()

            block.addLine(logger.style.misc('MailDev'))
            instanceMetadata.maildev.forEach(({ title, text }) => {
                block.addLine(`  ${title}: ${text}`)
            })

            block.log()

            process.exit(0)
        }
    )
}
