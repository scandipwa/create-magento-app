const configureElasticsearch = require('../magento/setup-magento/configure-searchengine')
const deleteAdminUsers = require('../magento/setup-magento/delete-admin-users')
const deleteCustomers = require('../magento/setup-magento/delete-customers')
const deleteOrders = require('../magento/setup-magento/delete-orders')
const disableCustomAdminPath = require('../magento/setup-magento/disable-custom-admin-path')
const varnishConfigSetup = require('../magento/setup-magento/varnish-config')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const enableForeignKeyCheck = () => ({
    task: ({ databaseConnection }) =>
        databaseConnection.query('SET FOREIGN_KEY_CHECKS = 0;')
})

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const disableForeignKeyCheck = () => ({
    task: ({ databaseConnection }) =>
        databaseConnection.query('SET FOREIGN_KEY_CHECKS = 1;')
})

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const fixDB = () => ({
    title: 'Fixing database',
    task: async (ctx, task) =>
        task.newListr(
            [
                varnishConfigSetup(),
                configureElasticsearch(),
                disableCustomAdminPath(),
                {
                    title: 'Deleting customers data',
                    skip: ({ withCustomersData }) => withCustomersData,
                    task: async (ctx, subTask) => {
                        const deleteCustomerData = await subTask.prompt({
                            type: 'Confirm',
                            message: `Do you want to delete customers data (orders, customers and admin users) from this dump?
This will reduce database size and remove possible interference for your setup.`
                        })

                        if (!deleteCustomerData) {
                            subTask.skip()
                            return
                        }

                        return subTask.newListr([
                            enableForeignKeyCheck(),
                            {
                                title: 'Deleting admin users, orders and customers...',
                                task: (ctx, subSubTask) =>
                                    subSubTask.newListr(
                                        [
                                            deleteAdminUsers(),
                                            deleteOrders(),
                                            deleteCustomers()
                                        ],
                                        {
                                            concurrent: true
                                        }
                                    ),
                                rollback: disableForeignKeyCheck()
                            },
                            disableForeignKeyCheck()
                        ])
                    },
                    options: {
                        rendererOptions: { collapse: false }
                    }
                }
            ],
            {
                concurrent: false,
                exitOnError: true,
                ctx,
                rendererOptions: { collapse: false }
            }
        )
})

module.exports = fixDB
