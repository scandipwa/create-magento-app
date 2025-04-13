const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const semver = require('semver')
const fs = require('fs')
const path = require('path')
const { request } = require('smol-request')
const KnownError = require('../../../errors/known-error')
const { NginxParser } = require('../../../util/nginx-logs-parser')
const sleep = require('../../../util/sleep')
const { containerApi } = require('../../docker/containers')

const pathToWorkingHealthCheckPhp = path.join(
    __dirname,
    '..',
    '..',
    'php',
    'working_health_check.php'
)
const pathToProjectsHealthCheckPhp = path.join(
    process.cwd(),
    'pub',
    'health_check.php'
)
const pathToHealthCheckBackupPhp = path.join(
    process.cwd(),
    'pub',
    'health_check-super-backup-file.php'
)

/**
 * @param {import('../../../../typings/context').ListrContext} ctx
 */
const getIsHealthCheckRequestBroken = async (ctx) => {
    const { nginx } = ctx.config.docker.getContainers(ctx.ports)
    const parser = new NginxParser(
        '$remote_addr - $remote_user [$time_local] "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent"'
    )
    const parsedLogs = await containerApi.logs({
        name: nginx.name,
        parser: (line) => parser.parseLine(line)
    })

    const healthCheckRequests = parsedLogs.filter(
        (line) =>
            line && line.request && line.request.includes('/health_check.php')
    )

    return healthCheckRequests.every(
        (parsedRequest) => parsedRequest.status !== '200'
    )
}

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const waitingForVarnish = () => ({
    title: 'Waiting for Varnish to return code 200',
    skip: (ctx) =>
        !ctx.config.overridenConfiguration.configuration.varnish.enabled ||
        ctx.config.overridenConfiguration.ssl.enabled ||
        !ctx.config.overridenConfiguration.configuration.varnish.healthCheck,
    task: async (ctx, task) => {
        const pureMagentoVersion = ctx.magentoVersion.match(
            /^([0-9]+\.[0-9]+\.[0-9]+)/
        )[1]

        const isMagento23 = semver.satisfies(pureMagentoVersion, '<2.4')
        let tries = 0
        while (tries < 10) {
            try {
                const response = await request(
                    `http://localhost:${ctx.ports.sslTerminator}/`,
                    {
                        responseType: 'headers'
                    }
                )

                if (response.status !== 200) {
                    tries++
                    await sleep(2000)
                } else {
                    break
                }
            } catch (e) {
                tries++
                await sleep(200)
            }
        }

        if (tries === 10 && isMagento23) {
            const isHealthCheckRequestBroken =
                await getIsHealthCheckRequestBroken(ctx)
            if (isHealthCheckRequestBroken) {
                const confirm = await task.prompt({
                    type: 'Select',
                    message: `We detected that your Magento instance is experiencing problems with Varnish server.
Health Check request is returning status 500.

Do you want to try resolving this issue by replacing ${logger.style.file(
                        './pub/health_check.php'
                    )} file content with content from newer Magento version (2.4.4)?`,
                    choices: [
                        {
                            name: 'yes',
                            message: "Okay, let's try that"
                        },
                        {
                            name: 'no',
                            message:
                                'I will try to fix this myself, thanks for the info!'
                        }
                    ]
                })

                if (confirm === 'yes') {
                    await fs.promises.writeFile(
                        pathToHealthCheckBackupPhp,
                        await fs.promises.readFile(
                            pathToProjectsHealthCheckPhp,
                            'utf-8'
                        ),
                        'utf-8'
                    )

                    task.output = `Backup made! Available at ${logger.style.file(
                        pathToHealthCheckBackupPhp
                    )}`

                    await fs.promises.writeFile(
                        pathToProjectsHealthCheckPhp,
                        await fs.promises.readFile(
                            pathToWorkingHealthCheckPhp,
                            'utf-8'
                        ),
                        'utf-8'
                    )

                    task.output = `${logger.style.file(
                        './pub/health_check.php'
                    )} content is replaced, waiting for nginx logs...`

                    let connectionFixed = false

                    for (let i = 0; i < 10; i++) {
                        try {
                            const response = await request(
                                `http://localhost:${ctx.ports.sslTerminator}/`,
                                {
                                    responseType: 'headers'
                                }
                            )

                            if (response.status !== 200) {
                                await sleep(2000)
                            } else {
                                connectionFixed = true
                                break
                            }
                        } catch (e) {
                            await sleep(200)
                        }
                    }

                    if (connectionFixed) {
                        task.output = 'Connection looks good!'
                        const secondConfirm = await task.prompt({
                            type: 'Select',
                            message: `Okay, looks like it helped!
Do you want to keep backed up ${logger.style.file('health_check.php')} file?`,
                            choices: [
                                {
                                    name: 'no',
                                    message:
                                        "I don't think I will need it anymore, thanks"
                                },
                                {
                                    name: 'yes',
                                    message:
                                        'I will keep it, maybe it will be useful (X to doubt)'
                                }
                            ]
                        })

                        if (secondConfirm === 'no') {
                            await fs.promises.rm(pathToHealthCheckBackupPhp)
                        }
                    }

                    return
                }

                task.skip('User choose to fix issue himself')
                return
            }
        }

        if (tries === 10) {
            throw new KnownError(`After 20 seconds website is still responding with non-200 code, which might indicate issue with setup.
Or Varnish is still loading...

Please check the logs!`)
        }
    },
    exitOnError: false,
    options: {
        bottomBar: 10
    }
})

module.exports = waitingForVarnish
