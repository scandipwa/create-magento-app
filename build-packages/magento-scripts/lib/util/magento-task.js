/* eslint-disable no-param-reassign */
const runMagentoCommand = require('./run-magento');

const magentoTask = (command) => ({
    title: `Running command 'magento ${command}'`,
    task: ({ magentoVersion }, task) => runMagentoCommand(command, {
        callback: (t) => {
            task.output = t;
        },
        magentoVersion,
        throwNonZeroCode: true
    }),
    option: {
        bottomBar: 10
    }
});

module.exports = magentoTask;
