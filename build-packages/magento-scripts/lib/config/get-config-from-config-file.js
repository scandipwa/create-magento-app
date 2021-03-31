/* eslint-disable no-param-reassign */
const fs = require('fs');
const path = require('path');
const { getConfigFromMagentoVersion, baseConfig } = require('.');
const deepmerge = require('../util/deepmerge');
const pathExists = require('../util/path-exists');
const setConfigFile = require('../util/set-config');
const { defaultMagentoConfig } = require('./magento-config');

const configJSFilePath = path.join(process.cwd(), 'cma.js');
const magentoConfigFilePath = path.join(baseConfig.cacheDir, 'app-config.json');

/**
 * @type {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const getConfigFromConfigFile = {
    task: async (ctx, task) => {
        const { magentoVersion } = ctx;

        if (ctx.edition) {
            if (!['community', 'enterprise'].includes(ctx.edition)) {
                throw new Error(`Magento edition "${ctx.edition}" does not exists or not supported!`);
            }
        }

        if (!ctx.config) {
            task.title = 'Getting config from configuration file';
        }

        if (!await pathExists(configJSFilePath)) {
            const legacyMagentoConfigExists = await pathExists(magentoConfigFilePath);

            let magentoConfiguration;

            if (legacyMagentoConfigExists) {
                const legacyMagentoConfig = JSON.parse(
                    await fs.promises.readFile(magentoConfigFilePath)
                );

                magentoConfiguration = legacyMagentoConfig.magento || legacyMagentoConfig;
            } else {
                magentoConfiguration = deepmerge(defaultMagentoConfig, {
                    edition: ctx.edition || 'community'
                });
            }

            await setConfigFile({
                configPathname: configJSFilePath,
                template: path.join(baseConfig.templateDir, 'cma-config.template.js'),
                overwrite: false,
                templateArgs: {
                    magentoConfiguration
                }
            });
        }

        ctx.config = await getConfigFromMagentoVersion(magentoVersion);
    }
};

module.exports = getConfigFromConfigFile;
