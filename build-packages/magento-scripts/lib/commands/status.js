const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const { Listr } = require('listr2')
const getMagentoVersionConfig = require('../config/get-magento-version-config')
const { getCachedPorts } = require('../config/get-port-config')

const { prettyStatus } = require('../tasks/status')
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
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {},
        async (args) => {
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
                    ctx: { throwMagentoVersionMissing: true, ...args },
                    rendererOptions: { collapse: false, clearOutput: false }
                }
            )

            try {
                await prettyStatus(await tasks.run())
            } catch (e) {
                logger.error(e.message || e)
                process.exit(1)
            }
            process.exit(0)
        }
    )
}
