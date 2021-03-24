const waitForIt = require('../../../util/wait-for-it');

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
module.exports = {
    title: 'Waiting for redis',
    task: async ({ ports }, task) => {
        await waitForIt({
            name: 'redis',
            host: '127.0.0.1',
            port: ports.redis,
            output: (t) => {
                // eslint-disable-next-line no-param-reassign
                task.output = t;
            }
        });
    },
    options: {
        bottomBar: 10
    }
};
