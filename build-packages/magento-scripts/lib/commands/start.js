const path = require('path')
const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const { Listr } = require('listr2')
const { start } = require('../tasks/start')
const pathExists = require('../util/path-exists')
const { baseConfig } = require('../config')
const googleAnalytics = require('../util/analytics')
const systeminformation = require('systeminformation')
const { getCSAThemes } = require('../util/CSA-theme')
const shouldUseYarn = require('@scandipwa/scandipwa-dev-utils/should-use-yarn')
const ConsoleBlock = require('../util/console-block')
const { getInstanceMetadata } = require('../util/instance-metadata')
const UnknownError = require('../errors/unknown-error')
const KnownError = require('../errors/known-error')

const cmaGaTrackingId = 'UA-127741417-7'

googleAnalytics.setGaTrackingId(cmaGaTrackingId)

/**
 * @param {(import('listr2').ListrError | Error | import('../errors/known-error') | import('../errors/unknown-error') | string)[]} errors
 */
const reportErrors = async (errors) => {
    for (const error of errors) {
        const path = (error.path && ` Error path: ${error.path} `) || ''
        if (error instanceof UnknownError || error instanceof KnownError) {
            logger.error(error.message)
            logger.error(error.stack)
            if (error instanceof UnknownError) {
                await googleAnalytics.trackError(
                    `Unknown Error:${path}${error.stack}`
                )
            } else {
                await googleAnalytics.trackError(
                    `Known Error:${path}${error.message}`
                )
            }
        } else if (error instanceof Error) {
            logger.error(error.message)
            logger.error(error.stack)
            await googleAnalytics.trackError(
                `Regular Error:${path}${error.message}`
            )
        } else {
            logger.error(error)
            logger.error(error.stack)
            await googleAnalytics.trackError(`Non Error:${path}${error}`) // track non-errors throws
        }
    }
}

/**
 * @param {import('yargs')} yargs
 */
module.exports = (yargs) => {
    yargs.command(
        'start',
        'Deploy the application.',
        (yargs) =>
            yargs
                .option('port', {
                    alias: 'p',
                    describe: 'Suggest a port for an application to run.',
                    type: 'number',
                    nargs: 1
                })
                .option('no-open', {
                    alias: 'n',
                    describe: 'Do not open browser after command finished',
                    type: 'boolean',
                    default: false
                })
                .option('skip-setup', {
                    alias: 's',
                    describe: 'Skip Magento setup',
                    type: 'boolean',
                    default: false
                })
                .option('edition', {
                    alias: 'e',
                    describe: 'Magento Edition to install',
                    type: 'string'
                })
                .option('recompile-php', {
                    describe: 'Recompile PHP version used in the project',
                    type: 'boolean'
                })
                .option('verbose', {
                    alias: 'v',
                    describe: 'Enable verbose logging',
                    type: 'boolean',
                    default: false
                })
                .option('', {
                    describe: 'Pull Docker images',
                    type: 'boolean',
                    default: false
                })
                .option('reset-global-config', {
                    describe: 'Reset global magento-scripts configuration',
                    type: 'boolean',
                    default: false
                }),
        async (args = {}) => {
            /**
             * @type {Listr<import('../../typings/context').ListrContext>}
             */
            const tasks = new Listr(start(), {
                exitOnError: true,
                ctx: args,
                concurrent: false,
                rendererOptions: {
                    showErrorMessage: false,
                    showTimer: true
                },
                collectErrors: 'minimal'
            })
            const timeStamp = Date.now()

            if (args.debug) {
                logger.warn(
                    'You are running in debug mode. Magento setup will be slow.'
                )
            }
            const legacyMagentoConfigExists = await pathExists(
                path.join(baseConfig.cacheDir, 'app-config.json')
            )
            const currentConfigExists = await pathExists(
                path.join(process.cwd(), 'cma.js')
            )
            if (legacyMagentoConfigExists && !currentConfigExists) {
                logger.warn(
                    'Magento configuration from app-config.json will be moved to cma.js in your projects directory.'
                )
            }

            /**
             * @type {import('../../typings/context').ListrContext}
             */
            let ctx

            try {
                ctx = await tasks.run()
            } catch (e) {
                await reportErrors([e])
                process.exit(1)
            }

            const {
                systemConfiguration: { analytics }
            } = ctx

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

            const themes = await getCSAThemes()
            if (themes.length > 0) {
                const theme = themes[0]
                block
                    .addEmptyLine()
                    .addSeparator('ScandiPWA')
                    .addEmptyLine()
                    .addLine(
                        'To run ScandiPWA theme in Magento mode, run the following command:'
                    )
                    .addLine(
                        `-> ${logger.style.command(`cd ${theme.themePath}`)}`
                    )
                    .addLine(
                        `-> ${logger.style.command(
                            `BUILD_MODE=magento ${
                                shouldUseYarn() ? 'yarn start' : 'npm start'
                            }`
                        )}`
                    )
            }

            block.addEmptyLine()

            if (process.isOutOfDateVersion) {
                block.addSeparator(logger.style.code('Warning')).addEmptyLine()
                process.isOutOfDateVersionMessage.forEach((line) => {
                    block.addLine(line)
                })

                block.addEmptyLine()
            }

            block.log()

            logger.note(
                `MariaDB credentials, containers status and project information available in ${logger.style.code(
                    'npm run status'
                )} command.
      To access Magento CLI, Composer and PHP for this project use ${logger.style.code(
          'npm run cli'
      )} command.`
            )
            logger.log('')

            if (tasks.err && tasks.err.length > 0) {
                logger.warn(
                    'During the start, we encountered some errors that have not impacted the start-up process!'
                )
                logger.log('')
                for (const err of tasks.err) {
                    logger.error(
                        `Error path: ${err.path}\nError message: ${err.message}\n\nError stack: ${err.stack}`
                    )
                }
            }

            if (!analytics) {
                process.exit(0)
            }

            try {
                await googleAnalytics.trackTiming(
                    'CMA start time',
                    Date.now() - timeStamp
                )
                if (!process.isFirstStart) {
                    googleAnalytics.printAboutAnalytics()
                    process.exit(0)
                }

                const { manufacturer, brand } = await systeminformation.cpu()
                const { platform, kernel } = await systeminformation.osInfo()
                const { total } = await systeminformation.mem()

                // Get ram amount in MB
                const totalRam = Math.round(total / 1024 / 1024)
                const paramInfo = `Platform: ${platform} ${kernel}, CPU model: ${manufacturer} ${brand}, RAM amount: ${totalRam}MB`

                await googleAnalytics.trackEvent('Params', paramInfo, 0, 'OS')
                googleAnalytics.printAboutAnalytics()
            } catch (e) {
                await googleAnalytics.trackError(e.message || e)
            }

            if (tasks.err && tasks.err.length > 0) {
                for (const err of tasks.err) {
                    console.log(err)
                }
                await reportErrors(tasks.err)
            }

            process.exit(0)
        }
    )
}
