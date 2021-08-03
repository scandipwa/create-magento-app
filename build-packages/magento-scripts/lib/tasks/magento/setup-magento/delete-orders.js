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

        await mysqlConnection.query('SET FOREIGN_KEY_CHECKS = 0;');

        await Promise.all(
            orderTables.map(
                (tableName) => mysqlConnection.query(`TRUNCATE TABLE \`${ tableName }\`;`)
            )
        );

        await mysqlConnection.query('SET FOREIGN_KEY_CHECKS = 1;');
    }
};

module.exports = deleteOrders;
