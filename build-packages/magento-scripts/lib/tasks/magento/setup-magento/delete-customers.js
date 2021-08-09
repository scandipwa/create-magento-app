/* eslint-disable max-len */

const { customerTables } = require('../../mysql/magento-tables');

/**
 * @type {import(listr2).ListrTask<import(../../../../typings/context).ListrContext>}
 */
const deleteCustomers = {
    title: 'Deleting customers',
    task: async (ctx, task) => {
        const { mysqlConnection, withCustomersData } = ctx;

        if (withCustomersData) {
            task.skip();
            return;
        }
        await Promise.all(
            customerTables.map(
                (tableName) => mysqlConnection.query(`TRUNCATE TABLE \`${ tableName }\`;`)
            )
        );
    }
};

module.exports = deleteCustomers;
