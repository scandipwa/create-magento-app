/* eslint-disable no-param-reassign */
const runPhpCode = require('./run-php');

/**
 * @type {(command: string, options: { noTitle: boolean }) => import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const phpTask = (command, options = {}) => ({
    title: !options.noTitle ? `Running command 'php ${command}` : undefined,
    task: ({ magentoVersion }, task) => runPhpCode(command, {
        callback: (t) => {
            task.output = t;
        },
        throwNonZeroCode: true,
        magentoVersion
    })
});

module.exports = phpTask;
