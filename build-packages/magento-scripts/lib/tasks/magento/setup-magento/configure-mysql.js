/* eslint-disable no-param-reassign */
const runMagentoCommand = require('../../../util/run-magento');
const sleep = require('../../../util/sleep');
const waitForIt = require('../../../util/wait-for-it');
const waitForLogs = require('../../../util/wait-for-logs');

module.exports = {
    title: 'Setting mysql magento database credentials',
    task: async ({
        ports,
        magentoVersion,
        config: { docker },
        magentoConfig: app
    }, task) => {
        const { mysql: { env, name } } = docker.getContainers(ports);

        await waitForIt({
            name: 'mysql',
            host: '127.0.0.1',
            port: ports.mysql,
            output: (t) => {
                task.output = t;
            }
        });

        // TODO connect to mysql logs and continue work after message reserved:
        // mysqld: ready for connections.

        const beforeMysqlReadyTime = Date.now();

        await waitForLogs({
            containerName: name,
            matchText: 'mysqld: ready for connections.'
        });

        const afterMysqlReadyTime = Date.now();

        const mysqlStartupTime = afterMysqlReadyTime - beforeMysqlReadyTime;

        await sleep(mysqlStartupTime);

        // TODO: handle error
        await runMagentoCommand(`setup:config:set \
        --db-host='127.0.0.1:${ ports.mysql }' \
        --db-name='${ env.MYSQL_DATABASE }' \
        --db-user='${ env.MYSQL_USER }' \
        --db-password='${ env.MYSQL_PASSWORD }' \
        --backend-frontname='${ app.adminuri }' \
        -n`, {
            throwNonZeroCode: false,
            magentoVersion,
            callback: (t) => {
                task.output = t;
            }
        });
    },
    options: {
        bottomBar: 10
    }
};
