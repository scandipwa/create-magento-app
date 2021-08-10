const adjustMagentoConfiguration = require('../magento/setup-magento/adjust-magento-configuration');
const configureElasticsearch = require('../magento/setup-magento/configure-elasticsearch');
const deleteAdminUsers = require('../magento/setup-magento/delete-admin-users');
const deleteCustomers = require('../magento/setup-magento/delete-customers');
const deleteOrders = require('../magento/setup-magento/delete-orders');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const enableForeignKeyCheck = () => ({
    task: ({ mysqlConnection }) => mysqlConnection.query('SET FOREIGN_KEY_CHECKS = 0;')
});

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const disableForeignKeyCheck = () => ({
    task: ({ mysqlConnection }) => mysqlConnection.query('SET FOREIGN_KEY_CHECKS = 1;')
});

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const fixDB = () => ({
    title: 'Fixing database',
    task: async (ctx, task) => task.newListr([
        adjustMagentoConfiguration(),
        configureElasticsearch(),
        enableForeignKeyCheck(),
        {
            task: (ctx, task) => task.newListr([
                deleteAdminUsers(),
                deleteOrders(),
                deleteCustomers()
            ], {
                concurrent: true
            }),
            rollback: disableForeignKeyCheck()
        },
        disableForeignKeyCheck()
    ], {
        concurrent: false,
        exitOnError: true,
        ctx,
        rendererOptions: { collapse: false }
    })
});

module.exports = fixDB;
