/* eslint-disable no-param-reassign */
const runMagentoCommand = require('../../../util/run-magento');

const installMagento = {
    title: 'Installing magento...',
    task: async ({ magentoVersion, magentoConfig: app }, task) => {
        await runMagentoCommand(`setup:install \
        --admin-firstname='${ app.first_name }' \
        --admin-lastname='${ app.last_name }' \
        --admin-email='${ app.email }' \
        --admin-user='${ app.user }' \
        --admin-password='${ app.password }'`, {
            magentoVersion,
            callback: (t) => {
                task.output = t;
            }
        });

        await runMagentoCommand('cache:enable', {
            magentoVersion,
            callback: (t) => {
                task.output = t;
            }
        });
    },
    options: {
        bottomBar: 15
    }
};

module.exports = installMagento;
