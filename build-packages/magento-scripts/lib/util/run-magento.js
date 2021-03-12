const { execAsyncSpawn } = require('./exec-async-command');
const { getConfigFromMagentoVersion, defaultConfiguration, magento } = require('../config');
/**
 * Execute magento command
 * @param {String} command magento command
 * @param {Object} options
 * @param {Boolean} options.logOutput Log output to console using logger
 * @param {Boolean} options.withCode
 * @param {String} options.cwd
 * @param {() => {}} options.callback
 * @param {Boolean} options.throwNonZeroCode Throw if command return non 0 code.
 * @param {String} options.magentoVersion Magento version for config
 */
const runMagentoCommand = async (command, options = {}) => {
    const {
        throwNonZeroCode = true,
        magentoVersion = defaultConfiguration.magentoVersion
    } = options;
    const {
        php,
        baseConfig: { magentoDir }
    } = await getConfigFromMagentoVersion(magentoVersion);
    const { code, result } = await execAsyncSpawn(`${php.binPath} -c ${php.iniPath} ${magento.binPath} ${command}`, {
        ...options,
        cwd: magentoDir,
        withCode: true
    });

    if (throwNonZeroCode && code !== 0) {
        throw new Error(`Code: ${code}
        Response: ${result}`);
    }

    return { code, result };
};

module.exports = runMagentoCommand;
