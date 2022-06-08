const runMagentoCommand = require('../../../util/run-magento');

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
module.exports = () => ({
    title: 'Creating admin user',
    task: async ({ magentoVersion, mysqlConnection, config: { magentoConfiguration } }, task) => {
        const [[{ userCount }]] = await mysqlConnection.query(`
            SELECT count(*) AS userCount
            FROM admin_user
            WHERE username = ?;
        `, [magentoConfiguration.user]);

        if (userCount === 1) {
            task.skip();
            return;
        }

        await runMagentoCommand(`admin:user:create \
        --admin-firstname='${ magentoConfiguration.first_name }' \
        --admin-lastname='${ magentoConfiguration.last_name }' \
        --admin-email='${ magentoConfiguration.email }' \
        --admin-user='${ magentoConfiguration.user }' \
        --admin-password='${ magentoConfiguration.password }'`, {
            magentoVersion
        });
    }
});
