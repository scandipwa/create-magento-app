const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const { Listr } = require('listr2')
const { checkRequirements } = require('../tasks/requirements')
const getMagentoVersionConfig = require('../config/get-magento-version-config')
const { execAsyncSpawn } = require('../util/exec-async-command')
const checkConfigurationFile = require('../config/check-configuration-file')
const getProjectConfiguration = require('../config/get-project-configuration')
const { getCachedPorts } = require('../config/get-port-config')
const dockerNetwork = require('../tasks/docker/network')

/**
 * @param {import('yargs')} yargs
 */
module.exports = (yargs) => {
    yargs.command(
        'logs <scope>',
        'Display application logs.',
        (yargs) => {
            yargs.usage(`Usage: npm run logs <scope>

Available scopes:
- magento
- php
- phpWithXdebug
- sslTerminator
- nginx
- redis
- mariadb
- elasticsearch
- maildev
- varnish (if enabled)

And you can use name matching:
npm run logs ma (will match magento)
npm run logs re (will match redis)`)
            yargs.option('tail', {
                alias: 'n',
                describe: 'Number of lines to show from the end of the logs',
                type: 'number'
            })

            yargs.option('details', {
                describe: 'Show extra details provided to logs',
                type: 'boolean',
                default: false
            })

            yargs.option('follow', {
                alias: 'f',
                describe: 'Follow log output',
                type: 'boolean',
                default: false
            })

            yargs.option('timestamps', {
                alias: 't',
                describe: 'Show timestamps',
                type: 'boolean',
                default: false
            })
            yargs.option('since', {
                describe:
                    'Show logs since timestamp (e.g. 2013-01-02T13:23:37Z) or relative (e.g. 42m for 42 minutes)',
                type: 'string'
            })
            yargs.option('until', {
                describe:
                    'Show logs before a timestamp (e.g. 2013-01-02T13:23:37Z) or relative (e.g. 42m for 42 minutes)',
                type: 'string'
            })
        },
        async (argv) => {
            const tasks = new Listr(
                [
                    checkRequirements(),
                    getMagentoVersionConfig(),
                    checkConfigurationFile(),
                    getProjectConfiguration(),
                    getCachedPorts(),
                    dockerNetwork.tasks.createNetwork()
                ],
                {
                    concurrent: false,
                    exitOnError: true,
                    ctx: { throwMagentoVersionMissing: true },
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
            const containers = ctx.config.docker.getContainers()
            const services = Object.keys(containers)

            if (
                services.includes(argv.scope) ||
                services.some((service) => service.includes(argv.scope))
            ) {
                const containerName = containers[argv.scope]
                    ? argv.scope
                    : Object.keys(containers).find((key) =>
                          key.includes(argv.scope)
                      )
                const commandArguments = [
                    argv.follow && '--follow',
                    argv.tail && `--tail ${argv.tail}`,
                    argv.details && '--details',
                    argv.timestamps && '--timestamps',
                    argv.since && `--since ${argv.since}`,
                    argv.until && `--until ${argv.until}`
                ]
                    .filter(Boolean)
                    .join(' ')
                const command = `docker logs ${containers[containerName].name} ${commandArguments}`

                logger.logN(
                    `Looking at the logs of ${logger.style.misc(
                        containerName
                    )}:`
                )
                await execAsyncSpawn(command, {
                    callback: logger.log
                })

                return
            }

            if (argv.scope === 'magento' || 'magento'.includes(argv.scope)) {
                await execAsyncSpawn('tail -f var/log/system.log', {
                    callback: logger.log
                })

                return
            }
            console.log(argv)
            logger.error(`No service found "${argv.scope}"`)
            process.exit(1)
        }
    )
}
