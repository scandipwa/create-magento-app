const fs = require('fs');
const path = require('path');
const deepmerge = require('./deepmerge');
const pathExists = require('./path-exists');

const resolveConfigurationWithOverrides = async (configuration) => {
    const configFilePath = path.join(process.cwd(), 'cma.json');
    if (await pathExists(configFilePath)) {
        const userConfiguration = JSON.parse(await fs.promises.readFile(configFilePath));
        return {
            ...configuration,
            configuration: deepmerge(
                configuration.configuration,
                userConfiguration.configuration || {}
            ),
            magento: deepmerge(
                configuration.magento,
                userConfiguration.magento || {}
            )
        };
    }

    return configuration;
};

module.exports = resolveConfigurationWithOverrides;
