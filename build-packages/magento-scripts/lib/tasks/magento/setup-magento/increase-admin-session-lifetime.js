const { updateTableValues } = require('../../../util/database');

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const increaseAdminSessionLifetime = () => ({
    title: 'Increase admin session lifetime to 1 month',
    task: async ({ mysqlConnection }, task) => updateTableValues('core_config_data', [
        {
            path: 'admin/security/session_lifetime',
            value: '2800000'
        },
        {
            path: 'admin/security/password_lifetime',
            value: null
        }
    ], {
        mysqlConnection,
        task
    })

});

module.exports = increaseAdminSessionLifetime;
