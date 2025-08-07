const flushRedisConfig = require('./flush-redis-config')
const migrateDatabase = require('./migrate-database')
const createAdmin = require('./create-admin')
const setDeploymentMode = require('./set-deployment-mode')
const setBaseUrl = require('./set-base-url')
const disableMaintenanceMode = require('./disable-maintenance-mode')
const disable2fa = require('./disable-2fa')
const setUrlRewrite = require('./set-url-rewrite')
const increaseAdminSessionLifetime = require('./increase-admin-session-lifetime')
const magentoTask = require('../../../util/magento-task')
const urnHighlighter = require('./urn-highlighter')
const enableFullPageCacheWithVarnish = require('./enable-full-page-cache-with-varnish')
const updateEnvPHP = require('../../php/update-env-php')
const setMailConfig = require('./set-mail-config')
const { setupMagentoFilePermissions } = require('./setup-file-permissions')

/**
 * @param {Object} [options]
 * @param {Boolean} [options.onlyInstallMagento]
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const setupMagento = (options = {}) => ({
    title: 'Setting up Magento',
    skip: ({ skipSetup }) => Boolean(skipSetup),
    task: (ctx, task) => {
        if (options.onlyInstallMagento) {
            return task.newListr([
                flushRedisConfig(),
                migrateDatabase({ onlyInstallMagento: true })
            ])
        }

        return task.newListr(
            [
                setupMagentoFilePermissions(),
                updateEnvPHP(),
                migrateDatabase(),
                flushRedisConfig(),
                {
                    title: 'Configuring Magento settings',
                    task: (ctx, task) =>
                        task.newListr(
                            [
                                setBaseUrl(),
                                setUrlRewrite(),
                                setMailConfig(),
                                increaseAdminSessionLifetime()
                            ],
                            {
                                concurrent: true,
                                rendererOptions: {
                                    collapse: false
                                }
                            }
                        )
                },
                createAdmin(),
                setDeploymentMode(),
                disableMaintenanceMode(),
                disable2fa(),
                urnHighlighter(),
                enableFullPageCacheWithVarnish(),
                magentoTask('cache:flush')
            ],
            {
                concurrent: false,
                exitOnError: true,
                ctx
            }
        )
    }
})

module.exports = setupMagento
