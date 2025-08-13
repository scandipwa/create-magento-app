const { Listr } = require('listr2')
const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const { checkRequirements } = require('./requirements')
const getMagentoVersionConfig = require('../config/get-magento-version-config')
const checkConfigurationFile = require('../config/check-configuration-file')
const getProjectConfiguration = require('../config/get-project-configuration')
const { getCachedPorts } = require('../config/get-port-config')
const checkPHPVersion = require('./requirements/php-version')
const {
    executeInContainer,
    runInContainer
} = require('../util/execute-in-container')
const { containerApi } = require('./docker/containers')
const dockerNetwork = require('./docker/network')
const KnownError = require('../errors/known-error')
const { prepareFileSystem } = require('./file-system')

/**
 *
 * @param {{ containerName: string, commands: string[] }} argv
 * @returns
 */
const executeTask = async (argv) => {
    const tasks = new Listr(
        [
            checkRequirements(),
            getMagentoVersionConfig(),
            checkConfigurationFile(),
            getProjectConfiguration(),
            getCachedPorts(),
            dockerNetwork.tasks.createNetwork(),
            checkPHPVersion(),
            prepareFileSystem()
        ],
        {
            concurrent: false,
            exitOnError: true,
            ctx: { throwMagentoVersionMissing: true },
            renderer: process.stdout.isTTY ? 'default' : 'silent',
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
    const containers = ctx.config.docker.getContainers(ctx.ports)
    const services = Object.keys(containers)

    if (
        services.includes(argv.containerName) ||
        services.some((service) => service.includes(argv.containerName))
    ) {
        const containerResult = containers[argv.containerName]
            ? containers[argv.containerName]
            : Object.entries(containers).find(([key]) =>
                  key.includes(argv.containerName)
              )

        if (!containerResult) {
            logger.error(`No container found "${argv.containerName}"`)
            process.exit(1)
        }

        const container =
            containerResult && Array.isArray(containerResult)
                ? containerResult[1]
                : containerResult

        if (argv.commands.length === 0) {
            // if we have default connect command then use it
            if (container.connectCommand) {
                argv.commands = container.connectCommand
            } else {
                // otherwise fall back to bash (if it exists inside container)
                argv.commands.push('bash')
            }
        }

        const containerList = await containerApi.ls({
            formatToJSON: true,
            all: true,
            filter: `name=${container.name}`
        })

        if (containerList.length > 0) {
            if (process.stdout.isTTY) {
                logger.logN(
                    `Executing container ${logger.style.misc(
                        container._
                    )} (command: ${logger.style.command(
                        argv.commands.join(' ')
                    )})`
                )
            }

            const result = executeInContainer({
                containerName: container.name,
                commands: argv.commands,
                user: container.user
            })

            return result
        }

        if (container.name.includes('php')) {
            if (process.stdout.isTTY) {
                logger.logN(
                    `Starting container ${logger.style.misc(
                        container._
                    )} with command: ${logger.style.command(
                        argv.commands.join(' ')
                    )}`
                )
            }

            const result = runInContainer(
                {
                    ...container,
                    name: `${container.name}_exec-${Date.now()}`
                },
                argv.commands
            )

            return result
        }

        throw new KnownError(`Container ${container.name} is not running!`)
    }

    logger.error(`No container found "${argv.containerName}"`)
    process.exit(1)
}

module.exports = {
    executeTask
}
