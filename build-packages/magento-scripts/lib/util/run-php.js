const UnknownError = require('../errors/unknown-error')
const { runPHPContainerCommand } = require('../tasks/php/php-container')
/**
 * Execute PHP code
 * @param {import('../../typings/context').ListrContext} ctx
 * @param {String} command php command
 * @param {Parameters<typeof import('../tasks/php/php-container')['runPHPContainerCommand']>[2] & { throwNonZeroCode?: boolean, useAutomaticUser?: boolean }} [options]
 */
const runPhpCode = async (ctx, command, options = {}) => {
    const { throwNonZeroCode = true } = options
    const { code, result } = await runPHPContainerCommand(
        ctx,
        `php ${command}`,
        {
            ...options,
            useAutomaticUser: true,
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
