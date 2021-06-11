/* eslint-disable max-len */

const { customerTables } = require('../../mysql/magento-tables');

/**
 * @type {import(listr2).ListrTask<import(../../../../typings/context).ListrContext>}
 */
const deleteCustomers = {
    title: 'Deleting customers',
    task: async (ctx) => {
        const { mysqlConnection } = ctx;

        await Promise.all(
            customerTables.map(
                (tableName) => mysqlConnection.query(`DELETE FROM \`${ tableName }\`;`)
            )
        );
    }
};

module.exports = deleteCustomers;
