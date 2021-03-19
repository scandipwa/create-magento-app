const fs = require('fs');
const path = require('path');
const { configFileSchema } = require('./config-file-validator');
const deepmerge = require('./deepmerge');
const pathExists = require('./path-exists');
const setConfigFile = require('./set-config');

// const configJSONFilePath = path.join(process.cwd(), 'cma.json');
const configJSFilePath = path.join(process.cwd(), 'cma.js');
// const configRCFilePath = path.join(process.cwd(), '.cmarc');

const resolveConfigurationWithOverrides = async (configuration, { templateDir, cacheDir }) => {
    if (await pathExists(configJSFilePath)) {
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
    }
    const magentoConfigFilePath = path.join(cacheDir, 'app-config.json');

    const legacyMagentoConfigExists = await pathExists(magentoConfigFilePath);

    let magentoConfiguration;

    if (legacyMagentoConfigExists) {
        const legacyMagentoConfig = JSON.parse(await fs.promises.readFile(magentoConfigFilePath));

        magentoConfiguration = legacyMagentoConfig.magento || legacyMagentoConfig;
    } else {
        magentoConfiguration = configuration.magento;
    }

    await setConfigFile({
        configPathname: configJSFilePath,
        template: path.join(templateDir, 'cma-config.template.js'),
        overwrite: false,
        templateArgs: {
            magentoConfiguration
        }
    });

    return {
        userConfiguration: {},
        overridenConfiguration: deepmerge(
            configuration,
            { magento: magentoConfiguration }
        )

    };
};

module.exports = resolveConfigurationWithOverrides;
