const adjustMagentoConfiguration = require('../magento/setup-magento/adjust-magento-configuration');
const configureElasticsearch = require('../magento/setup-magento/configure-elasticsearch');
const deleteAdminUsers = require('../magento/setup-magento/delete-admin-users');
const indexProducts = require('../magento/setup-magento/index-products');

const fixDB = {
    title: 'Fixing database',
    task: async (ctx, task) => task.newListr([
        adjustMagentoConfiguration,
        configureElasticsearch,
        deleteAdminUsers,
        indexProducts
    ], {
        concurrent: false,
        exitOnError: true,
        ctx,
        rendererOptions: { collapse: false }
    })
};

module.exports = fixDB;
