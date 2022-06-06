const { execAsyncSpawn } = require('../../util/exec-async-command');

/**
 * Will create database 'magento' in MySQL if it does not exist for some reason
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const createMagentoDatabase = () => ({
    title: 'Creating Magento database in MySQL',
    task: async (ctx) => {
        const { mysql } = ctx.config.docker.getContainers();

        await execAsyncSpawn(`docker exec ${mysql.name} mysql -umagento -pmagento -h 127.0.0.1 -e "CREATE DATABASE IF NOT EXISTS magento;"`);
    }
});

module.exports = {
    createMagentoDatabase
};
