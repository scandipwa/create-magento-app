const { magento } = require('../config');
const UnknownError = require('../errors/unknown-error');
const { runPHPContainerCommand } = require('../tasks/php/run-php-container');
/**
 * Execute magento command
 *
 * @param {import('../../typings/context').ListrContext} ctx
 * @param {String} command magento command
 * @param {Object} options
 * @param {Boolean} options.logOutput Log output to console using logger
 * @param {Boolean} options.withCode
 * @param {String} options.cwd
 * @param {() => {}} options.callback
 * @param {Boolean} options.throwNonZeroCode Throw if command return non 0 code.
 * @param {String} options.magentoVersion Magento version for config
 */
const runMagentoCommand = async (ctx, command, options = {}) => {
    const {
        throwNonZeroCode = true
    } = options;
    const { code, result } = await runPHPContainerCommand(ctx, `php ${magento.binPath} ${command}`, {
        ...options,
        cwd: ctx.config.baseConfig.magentoDir,
        withCode: true
    });

    if (throwNonZeroCode && code !== 0) {
        throw new UnknownError(`Code: ${code}
Response: ${result}`);
    }

    return { code, result };
};

module.exports = runMagentoCommand;
