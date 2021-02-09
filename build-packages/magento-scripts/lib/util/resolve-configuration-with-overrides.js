const fs = require('fs');
const path = require('path');
const deepmerge = require('./deepmerge');
const pathExists = require('./path-exists');

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

const resolveConfigurationWithOverrides = async (configuration, { templateDir }) => {
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

    await fs.promises.copyFile(
        path.join(templateDir, 'cma-config.template.js'),
        configJSFilePath
    );

    return {
        userConfiguration: {},
        overridenConfiguration: configuration
    };
};

module.exports = resolveConfigurationWithOverrides;
