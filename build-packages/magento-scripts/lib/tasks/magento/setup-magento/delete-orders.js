const { orderTables } = require('../../database/magento-tables')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const deleteOrders = () => ({
    title: 'Deleting orders',
    task: async (ctx, task) => {
        const { databaseConnection, withCustomersData } = ctx

        if (withCustomersData) {
            task.skip()
            return
        }

        const [rows] = await databaseConnection.query(
            'select TABLE_NAME from information_schema.TABLES;'
        )

        await Promise.all(
            orderTables
                .filter((tableName) =>
                    rows.some((row) => row.TABLE_NAME === tableName)
                )
                .map((tableName) =>
                    databaseConnection.query(`TRUNCATE TABLE \`${tableName}\`;`)
                )
        )
    }
})

module.exports = deleteOrders
