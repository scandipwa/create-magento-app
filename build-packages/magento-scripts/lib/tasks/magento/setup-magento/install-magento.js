const fs = require('fs')
const path = require('path')
const semver = require('semver')
const UnknownError = require('../../../errors/unknown-error')
const runMagentoCommand = require('../../../util/run-magento')
const envPhpToJson = require('../../../util/env-php-json')
const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const {
    defaultMagentoDatabase
} = require('../../database/default-magento-database')
const defaultMagentoUser = require('../../database/default-magento-user')

/**
 * @param {Object} param0
 * @param {Boolean} [param0.isDbEmpty]
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const installMagento = ({ isDbEmpty = false } = {}) => ({
    title: 'Installing Magento in Database',
    task: async (ctx, task) => {
        if (isDbEmpty) {
            task.output = 'No Magento is installed in DB!\nInstalling...'
        }
        const {
            magentoVersion,
            config: { magentoConfiguration },
            ports,
            databaseConnection,
            isDockerDesktop
        } = ctx

        const hostMachine = !isDockerDesktop
            ? '127.0.0.1'
            : 'host.docker.internal'

        const [tableResponse] = await databaseConnection.query(
            "SELECT * FROM information_schema.tables WHERE table_schema = 'magento' AND table_name = 'admin_user' LIMIT 1;"
        )

        if (tableResponse.length > 0) {
            const response = await databaseConnection.query(
                "select * from admin_user where username='admin';"
            )

            const usersWithUsernameAdmin =
                response && response.length > 0 && response[0]

            if (usersWithUsernameAdmin && usersWithUsernameAdmin.length > 0) {
                const confirmDeleteAdminUsers = await task.prompt({
                    type: 'Select',
                    message: `In order to install Magento in database you will need to delete admin user with username ${logger.style.command(
                        'admin'
                    )}`,
                    choices: [
                        {
                            name: 'delete-all',
                            message: `Delete all admin users (${logger.style.code(
                                'Recommended'
                            )})`
                        },
                        {
                            name: 'delete-only-admin',
                            message: `Delete only admin user with ${logger.style.command(
                                'admin'
                            )} username`
                        }
                    ]
                })

                await databaseConnection.query('SET FOREIGN_KEY_CHECKS = 0;')

                if (confirmDeleteAdminUsers === 'delete-all') {
                    await databaseConnection.query(`
                    TRUNCATE TABLE admin_user;
                `)
                } else {
                    await databaseConnection.query(`
                    DELETE FROM admin_user WHERE username='admin';
                `)
                }

                await databaseConnection.query('SET FOREIGN_KEY_CHECKS = 1;')
            }
        }
        const envPhpData = await envPhpToJson(ctx)

        const envPhpHaveEncryptionKey =
            envPhpData &&
            envPhpData.crypt &&
            envPhpData.crypt.key &&
            envPhpData.crypt.key

        let encryptionKeyOption = null

        if (ctx.encryptionKey) {
            encryptionKeyOption = `--key='${ctx.encryptionKey}'`
        }

        if (envPhpHaveEncryptionKey && !encryptionKeyOption) {
            encryptionKeyOption = `--key='${envPhpData.crypt.key}'`
        }

        let installed = false

        const pureMagentoVersion = magentoVersion.match(
            /^([0-9]+\.[0-9]+\.[0-9]+)/
        )[1]

        const isMagento23 = semver.satisfies(pureMagentoVersion, '<2.4')

        const elasticsearchConfiguration = ` \
--search-engine='elasticsearch7' \
--elasticsearch-host='${hostMachine}' \
--elasticsearch-port='${ports.elasticsearch}'`

        /**
         * @type {Array<Error>}
         */
        const errors = []

        for (let tries = 0; tries < 2; tries++) {
            try {
                const command = `setup:install \
                --admin-firstname='${magentoConfiguration.first_name}' \
                --admin-lastname='${magentoConfiguration.last_name}' \
                --admin-email='${magentoConfiguration.email}' \
                --admin-user='${magentoConfiguration.user}' \
                --admin-password='${magentoConfiguration.password}' \
                ${!isMagento23 ? elasticsearchConfiguration : ''} \
                ${encryptionKeyOption || ''} \
                --session-save=redis \
                --session-save-redis-host='${hostMachine}' \
                --session-save-redis-port='${ports.redis}' \
                --session-save-redis-log-level='3' \
                --session-save-redis-max-concurrency='30' \
                --session-save-redis-db='1' \
                --session-save-redis-disable-locking='1' \
                --cache-backend='redis' \
                --cache-backend-redis-server='${hostMachine}' \
                --cache-backend-redis-port='${ports.redis}' \
                --cache-backend-redis-db='0't \
                --db-host='${hostMachine}:${ports.mariadb}' \
                --db-name='${defaultMagentoDatabase}' \
                --db-user='${defaultMagentoUser.user}' \
                --db-password='${defaultMagentoUser.password}' \
                --backend-frontname='${magentoConfiguration.adminuri}' \
                --no-interaction`

                await runMagentoCommand(ctx, command, {
                    throwNonZeroCode: true,
                    callback: !ctx.verbose
                        ? undefined
                        : (t) => {
                              task.output = t
                          }
                })

                installed = true
            } catch (e) {
                errors.push(e)
            }

            if (installed) {
                break
            }
        }

        if (errors.length > 0) {
            if (
                envPhpHaveEncryptionKey &&
                errors.some((e) =>
                    e.message.includes(
                        "The default website isn't defined. Set the website and try again."
                    )
                )
            ) {
                const confirmToWipeEnvPhp = await task.prompt({
                    type: 'Confirm',
                    message: `We detected that your encryption key in ${logger.style.file(
                        'app/etc/env.php'
                    )} file is not accepted by Magento installer.
To fix this issue we will need to ${logger.style.misc(
                        'DELETE'
                    )} ${logger.style.file(
                        'app/etc/env.php'
                    )} file. It will be recreated but existing encryption key but if you any custom configuration in it will be lost.

Without this you will not be able to install Magento at this moment.

Do you want to continue?`
                })

                if (confirmToWipeEnvPhp) {
                    try {
                        await fs.promises.unlink(
                            path.join(process.cwd(), 'app', 'etc', 'env.php')
                        )
                    } catch (e) {
                        throw new UnknownError(
                            `Unexpected error occurred during deleting of app/etc/env.php file!\n\n${e}`
                        )
                    }
                    ctx.encryptionKey = envPhpData.crypt.key

                    return task.run(ctx)
                }
            }
        }

        if (!installed) {
            const errorMessages = errors.map((e) => e.message).join('\n\n')
            throw new UnknownError(
                `Unable to install Magento!\n${errorMessages}`
            )
        }
    },
    options: {
        bottomBar: 15
    }
})

module.exports = installMagento
