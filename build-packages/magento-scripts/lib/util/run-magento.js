const UnknownError = require('../errors/unknown-error')
const { runPHPContainerCommand } = require('../tasks/php/php-container')
/**
 * Execute magento command
 *
 * @param {import('../../typings/context').ListrContext} ctx
 * @param {String} command magento command
 * @param {Object} options
 * @param {Boolean} [options.logOutput] Log output to console using logger
 * @param {Boolean} [options.withCode]
 * @param {String} [options.cwd]
 * @param {() => {}} [options.callback]
 * @param {Boolean} [options.throwNonZeroCode] Throw if command return non 0 code.
 */
const runMagentoCommand = async (ctx, command, options = {}) => {
    const { throwNonZeroCode = true } = options
    const { code, result } = await runPHPContainerCommand(
        ctx,
        `bin/magento ${command}`,
        {
            ...options,
            withCode: true
        }
    )

    if (throwNonZeroCode && code !== 0) {
        throw new UnknownError(`Code: ${code}
Response: ${result}`)
    }

    return { code, result }
}

module.exports = runMagentoCommand
