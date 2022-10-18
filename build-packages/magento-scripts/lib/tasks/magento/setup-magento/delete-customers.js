const { customerTables } = require('../../database/magento-tables')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const deleteCustomers = () => ({
    title: 'Deleting customers',
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
            customerTables
                .filter((tableName) =>
                    rows.some((row) => row.TABLE_NAME === tableName)
                )
                .map((tableName) =>
                    databaseConnection.query(`TRUNCATE TABLE \`${tableName}\`;`)
                )
        )
    }
})

module.exports = deleteCustomers
