const waitForIt = require('../../../util/wait-for-it')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
module.exports = () => ({
    title: 'Waiting for Redis',
    task: ({ ports }, task) =>
        waitForIt({
            name: 'redis',
            host: '127.0.0.1',
            port: ports.redis,
            output: (t) => {
                task.output = t
            }
        }),
    options: {
        bottomBar: 10
    }
})
