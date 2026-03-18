const { Listr } = require('listr2')
const cli = require('../tasks/cli')
const createBashrcConfigFile = require('../tasks/cli/create-bashrc-config')
const getMagentoVersionConfig = require('../config/get-magento-version-config')
const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const getProjectConfiguration = require('../config/get-project-configuration')
const checkConfigurationFile = require('../config/check-configuration-file')
const ConsoleBlock = require('../util/console-block')
const {
    checkComposerCredentials
} = require('../tasks/requirements/composer-credentials')
const pkg = require('../../package.json')

/**
 * @param {import('yargs')} yargs
 */
module.exports = (yargs) => {
    yargs.command(
        'cli',
        'Enter CLI (magento, php, composer).',
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {},
        async () => {
            const tasks = new Listr(
                [
                    getMagentoVersionConfig(),
                    checkConfigurationFile(),
                    getProjectConfiguration(),
                    createBashrcConfigFile(),
                    checkComposerCredentials()
                ],
                {
                    concurrent: false,
                    exitOnError: true,
                    ctx: {
                        throwMagentoVersionMissing: true
                    },
                    rendererOptions: { collapse: false, clearOutput: true }
                }
            )

            let ctx
            try {
                ctx = await tasks.run()
            } catch (e) {
                logger.error(e.message || e)
                process.exit(1)
            }

            const block = new ConsoleBlock()

            block
                .addHeader('Create Magento App CLI')
                .addEmptyLine()
                .addLine(
                    `Magento version: ${logger.style.link(ctx.magentoVersion)}`
                )
                .addLine(
                    `${logger.style.file(
                        'magento-scripts'
                    )} version: ${logger.style.link(pkg.version)}`
                )
                .addEmptyLine()
                .addLine(
                    `Available aliases: ${logger.style.command(
                        'php'
                    )}, ${logger.style.command(
                        'magento'
                    )}, ${logger.style.command('composer')}`
                )
                .addLine(
                    `Available shortcuts: magento -> ${logger.style.command(
                        'm'
                    )}, composer -> ${logger.style.command('c')}`
                )
                .addEmptyLine()

            block
                .addLine(
                    `Execute into any service: ${logger.style.command(
                        'exec <service name>'
                    )}`
                )
                .addLine(
                    `Execute into PHP container: ${logger.style.command(
                        'exec php'
                    )}`
                )
                .addEmptyLine()

            if (
                ctx.config.overridenConfiguration.configuration.varnish.enabled
            ) {
                block.addLine(
                    `Clear Varnish cache: ${logger.style.command('cvc')}`
                )
            }

            block
                .addLine(
                    `Clear Magento cache: ${logger.style.command('m c:c')}`
                )
                .addLine(
                    `Magento setup upgrade: ${logger.style.command('m se:up')}`
                )
                .addLine(
                    `Magento DI compile: ${logger.style.command('m s:d:c')}`
                )
                .addEmptyLine()

            block
                .addLine(
                    `Clear Composer cache: ${logger.style.command('c cc')}`
                )
                .addEmptyLine()

            block
                .addLine(
                    `Connect to MariaDB server: ${logger.style.command(
                        'mariadb'
                    )}`
                )
                .addLine(
                    `Connect to MariaDB server as root: ${logger.style.command(
                        'mariadbroot'
                    )}`
                )
                .addEmptyLine()

            block
                .addSeparator('Debugging PHP')
                .addEmptyLine()
                .addLine('1. Start debugger in VSCode or PHPStorm')
                .addLine(
                    `2. Set breakpoint in any PHP file (example: ${logger.style.file(
                        'app/autoload.php'
                    )} or ${logger.style.file('pub/index.php')})`
                )
                .addEmptyLine()
                .addLine('Choose debugging approach:')
                .addLine(`A. Run CLI command to debug any PHP file or Magento:`)
                .addLine(`   ${logger.style.command('debugphp php -v')}`)
                .addLine(
                    `   ${logger.style.command(
                        'debugphp magento setup:upgrade'
                    )}`
                )
                .addLine(`   ${logger.style.command('debugphp magento ...')}`)
                .addEmptyLine()
                .addLine(
                    `B. Or enter PHP container with XDebug: ${logger.style.command(
                        'debugphp'
                    )}`
                )
                .addLine(
                    `   And run any command: ${logger.style.command(
                        'magento <command>'
                    )} or ${logger.style.command('php <command>')}`
                )
                .addEmptyLine()
                .addLine('Enjoy!')

            block.log()

            return cli()
        }
    )
}
