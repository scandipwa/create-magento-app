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
    executeInContainerNonInteractive,
    runInContainer,
    runInContainerNonInteractive
} = require('../util/execute-in-container')
const { containerApi } = require('./docker/containers')
const dockerNetwork = require('./docker/network')
const KnownError = require('../errors/known-error')
const { prepareFileSystem } = require('./file-system')
const { isNonInteractive } = require('../util/is-non-interactive')

/**
 *
 * @param {{ containerName: string, commands: string[], nonInteractive?: boolean, dryRun?: boolean }} argv
 * @returns
 */
const executeTask = async (argv) => {
    // --dry-run prints JSON, so it must never render tasks or prompt
    const nonInteractive = isNonInteractive(argv.nonInteractive || argv.dryRun)
    const tasks = new Listr(
        [
            checkRequirements({ requireComposerCredentials: false }),
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
            ctx: { throwMagentoVersionMissing: true, nonInteractive },
            renderer: nonInteractive ? 'silent' : 'default',
            rendererOptions: { collapse: false, clearOutput: true }
        }
    )

    let ctx
    try {
        ctx = await tasks.run()
    } catch (e) {
        logger.error(e instanceof Error ? e.message : String(e))
        process.exit(1)
    }
    const containers = /** @type {Record<string, any>} */ (
        ctx.config.docker.getContainers(ctx.ports)
    )
    const services = Object.keys(containers)

    if (
        services.includes(argv.containerName) ||
        services.some((service) => service.includes(argv.containerName))
    ) {
        const containerResult = containers[argv.containerName]
            ? [argv.containerName, containers[argv.containerName]]
            : Object.entries(containers).find(([key]) =>
                  key.includes(argv.containerName)
              )

        if (!containerResult) {
            logger.error(`No container found "${argv.containerName}"`)
            process.exit(1)
        }

        const [service, container] = containerResult

        // a dry run reports the default connect command instead
        if (nonInteractive && !argv.dryRun && argv.commands.length === 0) {
            logger.error('Non-interactive mode requires a command to execute')
            process.exit(1)
        }

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

        const running = containerList.length > 0

        if (argv.dryRun) {
            // Describes what exec would do, for tools that wrap it. Env values
            // are left out on purpose: they carry COMPOSER_AUTH credentials.
            const mode = running
                ? 'exec'
                : container.name.includes('php')
                ? 'run'
                : null
            const env = running ? container.execCommandEnv : container.env
            process.stdout.write(
                `${JSON.stringify(
                    {
                        service,
                        container: container.name,
                        image: container.image,
                        user: container.user || null,
                        running,
                        mode,
                        command: argv.commands,
                        env: Object.keys(env || {})
                    },
                    null,
                    2
                )}\n`
            )
            process.exit(mode ? 0 : 1)
        }

        if (running) {
            if (nonInteractive) {
                const result = await executeInContainerNonInteractive({
                    containerName: container.name,
                    commands: argv.commands,
                    user: container.user,
                    env: container.execCommandEnv
                })

                if (result.result) {
                    process.stdout.write(`${result.result}\n`)
                }
                process.exit(result.code)
            }

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
                user: container.user,
                env: container.execCommandEnv
            })

            return result
        }

        if (container.name.includes('php')) {
            if (nonInteractive) {
                const result = await runInContainerNonInteractive(
                    {
                        ...container,
                        name: `${container.name}_exec-${Date.now()}`
                    },
                    argv.commands
                )

                if (result.result) {
                    process.stdout.write(`${result.result}\n`)
                }
                process.exit(result.code)
            }

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
