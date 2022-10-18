const UnknownError = require('../errors/unknown-error')
const { runPHPContainerCommand } = require('../tasks/php/php-container')
/**
 * Execute PHP code
 * @param {import('../../typings/context').ListrContext} ctx
 * @param {String} command php command
 * @param {Object} options
 * @param {Boolean} options.logOutput Log output to console using logger
 * @param {Boolean} options.withCode
 * @param {String} options.cwd
 * @param {() => {}} options.callback
 * @param {Boolean} options.throwNonZeroCode Throw if command return non 0 code.
 * @param {Record<string, string>} options.env Environment variables
 * @param {Boolean} options.useRosettaOnMac Use Rosetta 2 on MacOS
 */
const runPhpCode = async (ctx, command, options = {}) => {
    const { throwNonZeroCode = true } = options
    const { code, result } = await runPHPContainerCommand(
        ctx,
        `php ${command}`,
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

module.exports = runPhpCode
