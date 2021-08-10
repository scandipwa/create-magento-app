const flushRedisConfig = require('./flush-redis-config');
const waitingForRedis = require('./waiting-for-redis');
const migrateDatabase = require('./migrate-database');
const createAdmin = require('./create-admin');
const setDeploymentMode = require('./set-deployment-mode');
const setBaseUrl = require('./set-base-url');
const disableMaintenanceMode = require('./disable-maintenance-mode');
const disable2fa = require('./disable-2fa');
const setUrlRewrite = require('./set-url-rewrite');
const updateEnvPHP = require('../../php/update-env-php');
const increaseAdminSessionLifetime = require('./increase-admin-session-lifetime');
const magentoTask = require('../../../util/magento-task');
const urnHighlighter = require('./urn-highlighter');

/**
 * @type {({ onlyInstallMagento: boolean }) => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const setupMagento = (options = {}) => ({
    title: 'Setting up Magento',
    skip: ({ skipSetup }) => skipSetup,
    task: (ctx, task) => {
        if (options.onlyInstallMagento) {
            return task.newListr([
                flushRedisConfig(),
                waitingForRedis(),
                updateEnvPHP(),
                migrateDatabase({ onlyInstallMagento: true })
            ]);
        }

        return task.newListr([
            flushRedisConfig(),
            waitingForRedis(),
            updateEnvPHP(),
            migrateDatabase(),
            {
                title: 'Configuring Magento settings',
                task: (ctx, task) => task.newListr([
                    setBaseUrl(),
                    setUrlRewrite(),
                    increaseAdminSessionLifetime()
                ], {
                    concurrent: true
                })
            },
            createAdmin(),
            setDeploymentMode(),
            disableMaintenanceMode(),
            disable2fa(),
            urnHighlighter(),
            magentoTask('cache:flush')
        ], {
            concurrent: false,
            exitOnError: true,
            ctx
        });
    }
});

module.exports = setupMagento;
