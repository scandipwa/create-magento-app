/* eslint-disable no-param-reassign */
const waitForIt = require('../../../util/wait-for-it');
const waitForLogs = require('../../../util/wait-for-logs');

module.exports = {
    title: 'Waiting for mysql',
    task: async ({
        ports,
        config: { docker }
    }, task) => {
        const { mysql: { name } } = docker.getContainers(ports);

        await waitForIt({
            name: 'mysql',
            host: '127.0.0.1',
            port: ports.mysql,
            output: (t) => {
                task.output = t;
            }
        });

        await waitForLogs({
            containerName: name,
            matchText: 'mysqld: ready for connections.'
        });
    },
    options: {
        bottomBar: 10
    }
};
