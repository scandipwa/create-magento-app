const { orderTables } = require('../../mysql/magento-tables');

/**
 * @type {import(listr2).ListrTask<import(../../../../typings/context).ListrContext>}
 */
const deleteOrders = {
    title: 'Deleting orders',
    task: async (ctx) => {
        const { mysqlConnection } = ctx;

        await Promise.all(
            orderTables.map(
                (tableName) => mysqlConnection.query(`DELETE FROM \`${ tableName }\`;`)
            )
        );
    }
};

module.exports = deleteOrders;
