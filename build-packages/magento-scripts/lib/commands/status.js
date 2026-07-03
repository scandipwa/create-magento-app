const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const { Listr } = require('listr2')
const getMagentoVersionConfig = require('../config/get-magento-version-config')
const { getCachedPorts } = require('../config/get-port-config')

const { prettyStatus, simpleStatus } = require('../tasks/status')
const { checkRequirements } = require('../tasks/requirements')
const { statusContainers } = require('../tasks/docker/containers')
const getProjectConfiguration = require('../config/get-project-configuration')
const checkConfigurationFile = require('../config/check-configuration-file')
const checkPHPVersion = require('../tasks/requirements/php-version')
const checkSearchEngineVersion = require('../tasks/requirements/searchengine-version')
const { getComposerVersionTask } = require('../tasks/composer')
const { systemApi } = require('../tasks/docker/system')

/**
 * @param {import('yargs')} yargs
 */
module.exports = (yargs) => {
    yargs.command(
        'status',
        'Show application status',
        (yargs) => {
            yargs
                .option('non-interactive', {
                    alias: 'n',
                    type: 'boolean',
                    default: false,
                    description:
                        'Print a plain-text status summary (for AI terminals and scripts)'
                })
                .option('verbose', {
                    alias: 'v',
                    type: 'boolean',
                    default: false,
                    description:
                        'Retrieve Docker image and volume sizes (slower, off by default)'
                })
        },
        async (args) => {
            const silent = /** @type {boolean} */ (args.silent)
            // A non-TTY stdout (pipe, CI, AI terminal) is inherently
            // non-interactive; the -n flag forces it even inside a TTY.
            const nonInteractive =
                !!(args.nonInteractive || args.n) || !process.stdout.isTTY
            // Enumerating per-image/-volume sizes shells out to
            // `docker system df --verbose`, which is slow; skip it by default.
            // The non-interactive report already prints the full status; the
            // --verbose flag only adds the Docker image/volume sizes (and is
            // what the pretty renderer needs to render them at all).
            const verbose = !!(args.verbose || args.v)
            const tasks = new Listr(
                [
                    checkRequirements(),
                    getMagentoVersionConfig(),
                    checkConfigurationFile(),
                    getProjectConfiguration(),
                    getCachedPorts(),
                    {
                        task: (_ctx, task) =>
                            task.newListr(
                                [
                                    checkPHPVersion(),
                                    getComposerVersionTask(),
                                    checkSearchEngineVersion(),
                                    {
                                        title: 'Retrieving Docker System data',
                                        skip: () =>
                                            !verbose &&
                                            'Docker image and volume sizes omitted (pass --verbose to include them)',
                                        task: async (ctx) => {
                                            ctx.systemDFData =
                                                await systemApi.df({
                                                    formatToJSON: true,
                                                    verbose: true
                                                })
                                        }
                                    }
                                ],
                                {
                                    concurrent: true
                                }
                            )
                    },
                    statusContainers()
                ],
                {
                    concurrent: false,
                    exitOnError: false,
                    ctx: {
                        throwMagentoVersionMissing: true,
                        ...args,
                        silent,
                        nonInteractive,
                        verbose
                    },
                    renderer: silent || nonInteractive ? 'silent' : 'default',
                    rendererOptions: { collapse: false, clearOutput: false }
                }
            )

            try {
                const ctx = await tasks.run()
                if (nonInteractive) {
                    simpleStatus(ctx)
                } else {
                    await prettyStatus(ctx)
                }
            } catch (e) {
                logger.error(e.message || e)
                process.exit(1)
            }
            process.exit(0)
        }
    )
}
