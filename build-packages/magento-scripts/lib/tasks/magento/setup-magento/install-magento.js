/* eslint-disable no-param-reassign */
const runMagentoCommand = require('../../../util/run-magento');

const installMagento = {
    title: 'Installing magento...',
    task: async ({
        magentoVersion,
        config: { docker, magentoConfiguration },
        ports
    }, task) => {
        const { mysql: { env } } = docker.getContainers(ports);
        await runMagentoCommand(`setup:install \
        --admin-firstname='${ magentoConfiguration.first_name }' \
        --admin-lastname='${ magentoConfiguration.last_name }' \
        --admin-email='${ magentoConfiguration.email }' \
        --admin-user='${ magentoConfiguration.user }' \
        --admin-password='${ magentoConfiguration.password }' \
        --search-engine='elasticsearch7' \
        --elasticsearch-host='127.0.0.1' \
        --elasticsearch-port='${ ports.elasticsearch }' \
        --session-save=redis \
        --session-save-redis-host='127.0.0.1' \
        --session-save-redis-port='${ ports.redis }' \
        --session-save-redis-log-level='3' \
        --session-save-redis-max-concurrency='30' \
        --session-save-redis-db='1' \
        --session-save-redis-disable-locking='1' \
        --cache-backend='redis' \
        --cache-backend-redis-server='127.0.0.1' \
        --cache-backend-redis-port='${ ports.redis }' \
        --cache-backend-redis-db='0't \
        --db-host='127.0.0.1:${ ports.mysql }' \
        --db-name='${ env.MYSQL_DATABASE }' \
        --db-user='${ env.MYSQL_USER }' \
        --db-password='${ env.MYSQL_PASSWORD }' \
        --backend-frontname='${ magentoConfiguration.adminuri }'`, {
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
