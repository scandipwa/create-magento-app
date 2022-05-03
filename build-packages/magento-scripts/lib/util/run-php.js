const { execAsyncSpawn } = require('./exec-async-command');
const { getConfigFromMagentoVersion, defaultConfiguration } = require('../config');
/**
 * Execute PHP code
 * @param {String} command magento command
 * @param {Object} options
 * @param {Boolean} options.logOutput Log output to console using logger
 * @param {Boolean} options.withCode
 * @param {String} options.cwd
 * @param {() => {}} options.callback
 * @param {Boolean} options.throwNonZeroCode Throw if command return non 0 code.
 * @param {String} options.magentoVersion Magento version for config
 * @param {Record<string, string>} options.env Environment variables
 */
const runPhpCode = async (command, options = {}) => {
    const {
        throwNonZeroCode = true,
        magentoVersion = defaultConfiguration.magentoVersion
    } = options;
    const { php } = await getConfigFromMagentoVersion(magentoVersion);
    let spawnCommand = `${php.binPath} -c ${php.iniPath} ${command}`;
    if (options.env && Object.keys(options.env).length > 0) {
        const env = Object.entries(options.env).map(([key, value]) => `${key}=${value}`).join(' ');
        spawnCommand = `${env} ${spawnCommand}`;
    }
    const { code, result } = await execAsyncSpawn(spawnCommand, {
        ...options,
        withCode: true
    });

    if (throwNonZeroCode && code !== 0) {
        throw new Error(`Code: ${code}
        Response: ${result}`);
    }

    return { code, result };
};

module.exports = runPhpCode;
