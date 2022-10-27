const { runPHPContainerCommand } = require('../tasks/php/php-container')

/**
 * @param {String} command
 * @param {{ noTitle?: boolean, env?: Record<string, string> }} [options]
 * @returns {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const phpTask = (command, options = {}) => ({
    title: !options.noTitle ? `Running command 'php ${command}` : undefined,
    task: (ctx, task) =>
        runPHPContainerCommand(ctx, command, {
            callback: (t) => {
                task.output = t
            },
            withCode: true
        })
})

module.exports = phpTask
