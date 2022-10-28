const { isTableExists } = require('../../../util/database')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const deleteAdminUsers = () => ({
    title: 'Deleting old admin users',
    skip: async (ctx) => !(await isTableExists('magento', 'admin_user', ctx)),
    task: async (ctx) => {
        const { databaseConnection } = ctx
        await databaseConnection.query(`
            TRUNCATE TABLE admin_user;
        `)
    }
})

module.exports = deleteAdminUsers
