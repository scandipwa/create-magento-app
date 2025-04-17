const UnknownError = require('../errors/unknown-error')
const { runPHPContainerCommand } = require('../tasks/php/php-container')
/**
 * Execute composer command
 * @param {import('../../typings/context').ListrContext} ctx
 * @param {String} command composer command
 * @param {Parameters<import('../tasks/php/php-container')['runPHPContainerCommand']>[2] & { throwNonZeroCode?: boolean, user?: string, useAutomaticUser?: boolean }} [options]
 */
const runComposerCommand = async (ctx, command, options = {}) => {
    const { throwNonZeroCode = true } = options
    const { code, result } = await runPHPContainerCommand(
        ctx,
        `composer ${command}`,
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

module.exports = runComposerCommand
