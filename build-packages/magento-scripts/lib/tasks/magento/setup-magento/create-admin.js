const runMagentoCommand = require('../../../util/run-magento');

const answers = ['Couldn\'t find the user account', 'was not locked or could not be unlocked'];

module.exports = {
    title: 'Creating admin user',
    task: async ({ magentoVersion, config: { magentoConfiguration } }, task) => {
        const { result: userStatus } = await runMagentoCommand(`admin:user:unlock ${magentoConfiguration.user} -n`, {
            magentoVersion
        });

        if (answers.some((a) => userStatus.includes(a))) {
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
};
