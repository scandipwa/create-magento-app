/* eslint-disable no-param-reassign */
const runMagentoCommand = require('./run-magento');

/**
 * @type {(command: string) => import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const magentoTask = (command) => ({
    title: `Running command 'magento ${command}'`,
    task: ({ magentoVersion }, task) => runMagentoCommand(command, {
        callback: (t) => {
            task.output = t;
        },
        magentoVersion,
        throwNonZeroCode: true
    }),
    options: {
        bottomBar: 10
    }
});

module.exports = magentoTask;
