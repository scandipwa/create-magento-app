const adjustMagentoConfiguration = require('../magento/setup-magento/adjust-magento-configuration');
const configureElasticsearch = require('../magento/setup-magento/configure-elasticsearch');
const deleteAdminUsers = require('../magento/setup-magento/delete-admin-users');
const deleteCustomers = require('../magento/setup-magento/delete-customers');
const deleteOrders = require('../magento/setup-magento/delete-orders');
const indexProducts = require('../magento/setup-magento/index-products');

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const fixDB = {
    title: 'Fixing database',
    task: async (ctx, task) => task.newListr([
        adjustMagentoConfiguration,
        configureElasticsearch,
        deleteAdminUsers,
        deleteOrders,
        deleteCustomers,
        indexProducts
    ], {
        concurrent: false,
        exitOnError: true,
        ctx,
        rendererOptions: { collapse: false }
    })
};

module.exports = fixDB;
