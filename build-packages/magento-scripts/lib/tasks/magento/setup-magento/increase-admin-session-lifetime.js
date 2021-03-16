const { updateTableValues } = require('../../../util/database');

const increaseAdminSessionLifetime = {
    title: 'Increase admin sessiono lifetime to 1 month',
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
