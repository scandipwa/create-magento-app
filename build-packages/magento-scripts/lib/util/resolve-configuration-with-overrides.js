const fs = require('fs');
const path = require('path');
const deepmerge = require('./deepmerge');
const pathExists = require('./path-exists');
const setConfigFile = require('./set-config');

// const configJSONFilePath = path.join(process.cwd(), 'cma.json');
const configJSFilePath = path.join(process.cwd(), 'cma.js');
// const configRCFilePath = path.join(process.cwd(), '.cmarc');

// const checkForManyConfigFiles = async () => {
//     const configFileExistsCount = (await Promise.all(
//         [configJSONFilePath, configJSFilePath, configRCFilePath]
//             .map(pathExists)
//     )).reduce((acc, val) => (acc + (val === true ? 1 : 0)), 0);

//     if (configFileExistsCount > 1) {
//         throw new Error('You have too many config files!\nPlease use only one of them.');
//     }
// };

const resolveConfigurationWithOverrides = async (configuration, { templateDir, cacheDir }) => {
    // await checkForManyConfigFiles();
    // if (await pathExists(configJSONFilePath)) {
    //     const userConfiguration = JSON.parse(await fs.promises.readFile(configJSONFilePath));
    //     const overridenConfiguration = {
    //         ...configuration,
    //         configuration: deepmerge(
    //             configuration.configuration,
    //             userConfiguration.configuration || {}
    //         ),
    //         magento: deepmerge(
    //             configuration.magento,
    //             userConfiguration.magento || {}
    //         )
    //     };

    //     return {
    //         userConfiguration,
    //         overridenConfiguration
    //     };
    // }
    // if (await pathExists(configRCFilePath)) {
    //     const userConfiguration = JSON.parse(await fs.promises.readFile(configRCFilePath));
    //     const overridenConfiguration = {
    //         ...configuration,
    //         configuration: deepmerge(
    //             configuration.configuration,
    //             userConfiguration.configuration || {}
    //         ),
    //         magento: deepmerge(
    //             configuration.magento,
    //             userConfiguration.magento || {}
    //         )
    //     };

    //     return {
    //         userConfiguration,
    //         overridenConfiguration
    //     };
    // }
    if (await pathExists(configJSFilePath)) {
        const userConfiguration = require(configJSFilePath);
        const overridenConfiguration = {
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
        overridenConfiguration: {
            ...configuration,
            magento: deepmerge(
                configuration.magento,
                magentoConfiguration
            )
        }
    };
};

module.exports = resolveConfigurationWithOverrides;
