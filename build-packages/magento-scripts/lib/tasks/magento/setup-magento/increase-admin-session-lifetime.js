const { updateTableValues } = require('../../../util/database')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const increaseAdminSessionLifetime = () => ({
    title: 'Increase admin session lifetime to 1 year',
    task: async ({ databaseConnection }, task) =>
        updateTableValues(
            'core_config_data',
            [
                {
                    // 1 year — the maximum Magento allows; also the cap the
                    // Redis session handler applies to session TTLs
                    path: 'admin/security/session_lifetime',
                    value: '31536000'
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
