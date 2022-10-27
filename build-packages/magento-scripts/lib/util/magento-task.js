const UnknownError = require('../errors/unknown-error')
const runMagentoCommand = require('./run-magento')

/**
 * @param {String} command
 * @param {Object} [options]
 * @param {(e: Error) => void} [options.onError]
 * @returns {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const magentoTask = (command, options = {}) => ({
    title: `Running command 'magento ${command}'`,
    task: async (ctx, task) => {
        try {
            await runMagentoCommand(ctx, command, {
                callback: !ctx.verbose
                    ? undefined
                    : (t) => {
                          task.output = t
                      },
                throwNonZeroCode: true
            })
        } catch (e) {
            if (e instanceof UnknownError && options.onError) {
                options.onError(e)
            }

            throw e
        }
    },
    options: {
        bottomBar: 10
    }
})

module.exports = magentoTask
