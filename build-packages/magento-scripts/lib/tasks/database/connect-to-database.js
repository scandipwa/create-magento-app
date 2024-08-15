const mysql2 = require('mysql2/promise')
const UnknownError = require('../../errors/unknown-error')
const { execAsyncSpawn } = require('../../util/exec-async-command')
const sleep = require('../../util/sleep')
const { createMagentoDatabase } = require('./create-magento-database')
const { createMagentoUser } = require('./create-magento-user')
const defaultMagentoUser = require('./default-magento-user')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const waitForDatabaseInitialization = () => ({
    title: 'Waiting for Database to initialize',
    task: async (ctx, task) => {
        const { mariadb } = ctx.config.docker.getContainers()

        let databaseReadyForConnections = false

        while (!databaseReadyForConnections) {
            const databaseOutput = await execAsyncSpawn(
                `docker logs ${mariadb.name}`
            )
            // we can't rely on ready for connections message because it's written 1 or 2 times depending if data is already there or not
            // changed to rely on server socket created message
            if (databaseOutput.includes('Server socket created on IP')) {
                databaseReadyForConnections = true
                break
            } else if (databaseOutput.includes('Initializing database files')) {
                task.output = `${mariadb._} is initializing database files!
Please wait, this will take some time and do not restart the ${mariadb._} container until initialization is finished!`

                let databaseFinishedInitialization = false
                while (!databaseFinishedInitialization) {
                    const databaseOutput2 = await execAsyncSpawn(
                        `docker logs ${mariadb.name}`
                    )
                    if (
                        databaseOutput2.includes('init process done.') &&
                        !databaseFinishedInitialization
                    ) {
                        databaseFinishedInitialization = true
                        break
                    }
                    await sleep(2000)
                }
            }

            await sleep(2000)
        }
    },
    options: {
        bottomBar: 10
    }
})

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const gettingDatabaseConnection = () => ({
    title: 'Getting Database connection',
    task: async (ctx, task) => {
        const {
            config: { docker },
            ports
        } = ctx
        const { mariadb } = docker.getContainers(ctx.ports)
        let tries = 0
        const maxTries = 20
        const errors = []

        while (tries < maxTries) {
            tries++
            try {
                const connection = await mysql2.createConnection({
                    host: '127.0.0.1',
                    port: ports.mariadb,
                    user: defaultMagentoUser.user,
                    password: defaultMagentoUser.password,
                    database: 'magento'
                })

                ctx.databaseConnection = connection
                break
            } catch (e) {
                errors.push(e)
            }
            await sleep(1000)
        }

        if (tries === maxTries) {
            throw new UnknownError(
                `Unable to connect to ${
                    mariadb._
                } server. Check your server configuration!\n\n${errors.join(
                    ' '
                )}`
            )
        }

        task.title = `${mariadb._} server connected!`
    }
})

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const terminatingExistingConnection = () => ({
    title: 'Terminating existing Database connection',
    skip: (ctx) => !ctx.databaseConnection,
    task: (ctx) => {
        ctx.databaseConnection.destroy()
    }
})

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const connectToDatabase = () => ({
    title: 'Connecting to Database server',
    skip: (ctx) => ctx.skipSetup,
    task: (ctx, task) =>
        task.newListr(
            [
                waitForDatabaseInitialization(),
                createMagentoDatabase(),
                createMagentoUser(),
                terminatingExistingConnection(),
                gettingDatabaseConnection()
            ],
            {
                concurrent: false,
                rendererOptions: {
                    collapse: true
                }
            }
        ),
    options: {
        bottomBar: 10
    }
})

module.exports = connectToDatabase
