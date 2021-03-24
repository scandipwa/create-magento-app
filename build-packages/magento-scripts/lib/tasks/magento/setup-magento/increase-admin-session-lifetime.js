const { updateTableValues } = require('../../../util/database');

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const increaseAdminSessionLifetime = {
    title: 'Increase admin session lifetime to 1 month',
    task: async (ctx, task) => {
        const { mysqlConnection } = ctx;
        await updateTableValues('core_config_data', [
            {
                path: 'admin/security/session_lifetime',
                value: '2800000'
            }
        ], {
            mysqlConnection,
            task
        });
    }
};

module.exports = increaseAdminSessionLifetime;
