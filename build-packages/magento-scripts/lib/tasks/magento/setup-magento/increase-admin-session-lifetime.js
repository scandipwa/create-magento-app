const { updateTableValues } = require('../../../util/database')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const increaseAdminSessionLifetime = () => ({
    title: 'Increase admin session lifetime to 1 month',
    task: async ({ databaseConnection }, task) =>
        updateTableValues(
            'core_config_data',
            [
                {
                    path: 'admin/security/session_lifetime',
                    value: '2800000'
                },
                {
                    path: 'admin/security/password_lifetime',
                    value: null
                }
            ],
            {
                databaseConnection,
                task
            }
        )
})

module.exports = increaseAdminSessionLifetime
