const flushRedisConfig = require('./flush-redis-config');
const waitingForRedis = require('./waiting-for-redis');
const migrateDatabase = require('./migrate-database');
const createAdmin = require('./create-admin');
const setDeploymentMode = require('./set-deployment-mode');
const setBaseUrl = require('./set-base-url');
const postDeploy = require('./post-deploy');
const disable2fa = require('./disable-2fa');
const setUrlRewrite = require('./set-url-rewrite');
const updateEnvPHP = require('../../php/update-env-php');
const increaseAdminSessionLifetime = require('./increase-admin-session-lifetime');
const magentoTask = require('../../../util/magento-task');

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const setupMagento = {
    title: 'Setting up Magento',
    skip: ({ skipSetup }) => skipSetup,
    task: async (ctx, task) => task.newListr([
        flushRedisConfig,
        waitingForRedis,
        updateEnvPHP,
        migrateDatabase,
        setBaseUrl,
        setUrlRewrite,
        increaseAdminSessionLifetime,
        createAdmin,
        setDeploymentMode,
        postDeploy,
        disable2fa,
        magentoTask('cache:flush')
    ], {
        concurrent: false,
        exitOnError: true,
        ctx
    })
};

module.exports = setupMagento;
