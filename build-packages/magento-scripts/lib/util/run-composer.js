const { execAsyncSpawn } = require('./exec-async-command');
const { getConfigFromMagentoVersion, defaultConfiguration } = require('../config');
const UnknownError = require('../errors/unknown-error');
/**
 * Execute composer command
 * @param {String} command composer command
 * @param {Object} options
 * @param {Boolean} options.throwNonZeroCode Throw if command return non 0 code.
 * @param {String} options.magentoVersion Magento version for config
 */
const runComposerCommand = async (command, options = {}) => {
    const {
        throwNonZeroCode = true,
        magentoVersion = defaultConfiguration.name
    } = options;
    const {
        php,
        composer,
        baseConfig: { magentoDir }
    } = await getConfigFromMagentoVersion(magentoVersion);
    const { code, result } = await execAsyncSpawn(`${php.binPath} -c ${php.iniPath} ${composer.binPath} ${command}`, {
        ...options,
        cwd: magentoDir,
        withCode: true
    });

    if (throwNonZeroCode && code !== 0) {
        throw new UnknownError(`Code: ${code}
Response: ${result}`);
    }

    return { code, result };
};

module.exports = runComposerCommand;
