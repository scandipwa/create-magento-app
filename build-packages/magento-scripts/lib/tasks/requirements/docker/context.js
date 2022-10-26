const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const os = require('os')
const { cmaGlobalConfig } = require('../../../config/cma-config')
const { getCachedPorts } = require('../../../config/get-port-config')
const { getSystemConfigTask } = require('../../../config/system-config')
const UnknownError = require('../../../errors/unknown-error')
const { execCommandTask } = require('../../../util/exec-async-command')
const createCacheFolder = require('../../cache/create-cache-folder')
const { dockerApi } = require('../../docker')
const { stopContainers } = require('../../docker/containers')
const { getDockerEngineAndDesktopServiceStatus } = require('./running-status')
const getMagentoVersionConfig = require('../../../config/get-magento-version-config')
const checkConfigurationFile = require('../../../config/check-configuration-file')
const getProjectConfiguration = require('../../../config/get-project-configuration')
const getDockerVersion = require('./version')

const USE_DEFAULT_DOCKER_DESKTOP_CONTEXT_ANSWER =
    'useDefaultDockerDesktopContext'

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const checkDockerDesktopContext = () => ({
    task: async (ctx, task) => {
        if (os.platform() !== 'linux' || !ctx.isDockerDesktop) {
            task.skip()
            return
        }

        task.title = 'Checking contexts for Docker Desktop'

        const contexts = await dockerApi.context({ formatToJSON: true })
        const currentlyUsedContext = contexts.find((c) => c.Current)

        if (!currentlyUsedContext) {
            throw new UnknownError("We haven't found contexts in Docker...")
        }

        const { engine } = await getDockerEngineAndDesktopServiceStatus()

        if (currentlyUsedContext.Name !== 'default' && engine.exists) {
            if (
                cmaGlobalConfig.get(
                    USE_DEFAULT_DOCKER_DESKTOP_CONTEXT_ANSWER
                ) === false
            ) {
                task.skip()
                return
            }

            const confirmContextChange = await task.prompt({
                type: 'Select',
                message: `Do you want to change current Docker Desktop context (${logger.style.code(
                    currentlyUsedContext.Name
                )}) to ${logger.style.code('default')}?`,
                choices: [
                    {
                        name: 'yes',
                        message: 'Yes'
                    },
                    {
                        name: 'no',
                        message:
                            "No, I don't know what this means, but you can ask again on next start."
                    },
                    {
                        name: 'skip',

                        message:
                            "I do know what this means and I DON'T want to change context for Docker. Also, save this answer to never ask again."
                    }
                ]
            })

            if (confirmContextChange === 'skip') {
                cmaGlobalConfig.set(
                    USE_DEFAULT_DOCKER_DESKTOP_CONTEXT_ANSWER,
                    false
                )
                task.skip()
            }

            if (confirmContextChange === 'yes') {
                return task.newListr([
                    getMagentoVersionConfig(),
                    checkConfigurationFile(),
                    getProjectConfiguration(),
                    createCacheFolder(),
                    getSystemConfigTask(),
                    getCachedPorts(),
                    stopContainers(),
                    execCommandTask('docker context use default'),
                    getDockerVersion()
                ])
            }
        }
    }
})

module.exports = checkDockerDesktopContext
