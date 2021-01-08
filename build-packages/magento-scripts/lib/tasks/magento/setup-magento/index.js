const flushRedisConfig = require('./flush-redis-config');
const waitingForMysql = require('./waiting-for-mysql');
const waitingForRedis = require('./waiting-for-redis');
const migrateDatabase = require('./migrate-database');
const configureElasticsearch = require('./configure-elasticsearch');
const createAdmin = require('./create-admin');
const setDeploymentMode = require('./set-deployment-mode');
const setBaseUrl = require('./set-base-url');
const postDeploy = require('./post-deploy');
const disable2fa = require('./disable-2fa');
const setUrlRewrite = require('./set-url-rewrite');

const setupMagento = {
    title: 'Setup magento',
    skip: ({ skipSetup }) => skipSetup,
    task: async (ctx, task) => task.newListr([
        flushRedisConfig,
        waitingForRedis,
        waitingForMysql,
        migrateDatabase,
        configureElasticsearch,
        createAdmin,
        setDeploymentMode,
        setBaseUrl,
        setUrlRewrite,
        postDeploy,
        disable2fa
    ], {
        concurrent: false,
        exitOnError: true,
        ctx
    })
};

module.exports = setupMagento;
