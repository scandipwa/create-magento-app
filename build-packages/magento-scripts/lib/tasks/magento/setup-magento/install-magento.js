/* eslint-disable no-param-reassign */
const runMagentoCommand = require('../../../util/run-magento');

const installMagento = {
    title: 'Installing magento...',
    task: async ({ magentoVersion, magentoConfig: app, ports }, task) => {
        await runMagentoCommand(`setup:install \
        --admin-firstname='${ app.first_name }' \
        --admin-lastname='${ app.last_name }' \
        --admin-email='${ app.email }' \
        --admin-user='${ app.user }' \
        --admin-password='${ app.password }' \
        --search-engine='elasticsearch7' \
        --elasticsearch-host='127.0.0.1' \
        --elasticsearch-port='${ ports.elasticsearch }'`, {
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
