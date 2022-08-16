const { execAsyncSpawn } = require('../../util/exec-async-command');

/**
 * Will create database 'magento' in MariaDB if it does not exist for some reason
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const createMagentoDatabase = () => ({
    title: 'Creating Magento database',
    task: async (ctx, task) => {
        const { mariadb } = ctx.config.docker.getContainers();
        task.title = `Creating Magento database in ${ mariadb._ }`;
        await execAsyncSpawn(`docker exec ${mariadb.name} mysql -umagento -pmagento -h 127.0.0.1 -e "CREATE DATABASE IF NOT EXISTS magento;"`);
    }
});

module.exports = {
    createMagentoDatabase
};