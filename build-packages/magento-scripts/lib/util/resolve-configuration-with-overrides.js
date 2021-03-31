const path = require('path');
const { configFileSchema } = require('./config-file-validator');
const deepmerge = require('./deepmerge');

const configJSFilePath = path.join(process.cwd(), 'cma.js');

const resolveConfigurationWithOverrides = async (configuration) => {
    const userConfiguration = require(configJSFilePath);

    try {
        await configFileSchema.validateAsync(userConfiguration);
    } catch (e) {
        throw new Error(`Configuration file validation error!\n\n${e.message}`);
    }

    const overridenConfiguration = deepmerge(configuration, userConfiguration);

    return {
        userConfiguration,
        overridenConfiguration
    };
};

module.exports = resolveConfigurationWithOverrides;
