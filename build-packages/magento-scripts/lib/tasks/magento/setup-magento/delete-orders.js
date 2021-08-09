const { orderTables } = require('../../mysql/magento-tables');

/**
 * @type {import(listr2).ListrTask<import(../../../../typings/context).ListrContext>}
 */
const deleteOrders = {
    title: 'Deleting orders',
    task: async (ctx, task) => {
        const { mysqlConnection, withCustomersData } = ctx;

        if (withCustomersData) {
            task.skip();
            return;
        }

        await Promise.all(
            orderTables.map(
                (tableName) => mysqlConnection.query(`TRUNCATE TABLE \`${ tableName }\`;`)
            )
        );
    }
};

module.exports = deleteOrders;
