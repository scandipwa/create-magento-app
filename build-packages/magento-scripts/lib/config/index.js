const path = require('path');
const getDockerConfig = require('./docker');
const {
    getConfigurations,
    defaultConfiguration
} = require('./versions');
const getPhpConfig = require('./php-config');
const { getMagentoConfig } = require('./magento-config');
const resolveConfigurationWithOverrides = require('../util/resolve-configuration-with-overrides');
const { getPrefix, folderName } = require('../util/prefix');
const UnknownError = require('../errors/unknown-error');

const platforms = ['linux', 'darwin'];
const darwinMinimalVersion = '10.5';

/**
 * @returns {import('../../typings/context').ListrContext['config']['baseConfig']}
 */
const getBaseConfig = (projectPath = process.cwd(), prefix = folderName) => ({
    prefix: getPrefix(prefix),
    magentoDir: projectPath,
    containerMagentoDir: '/var/www/html',
    templateDir: path.join(__dirname, 'templates'),
    cacheDir: path.join(projectPath, 'node_modules', '.create-magento-app-cache')
});

const baseConfig = getBaseConfig();

const magento = {
    binPath: path.join(baseConfig.magentoDir, 'bin', 'magento'),
    containerBinPath: path.join(baseConfig.containerMagentoDir, 'bin', 'magento')
};

module.exports = {
    /**
     * @param {string} magentoVersion
     */
    async getConfigFromMagentoVersion(ctx, {
        magentoVersion,
        projectPath = process.cwd(),
        prefix = folderName
    }) {
        const newBaseConfig = getBaseConfig(projectPath, prefix);
        const configurations = getConfigurations(newBaseConfig);
        if (!configurations[magentoVersion]) {
            throw new UnknownError(`No config found for magento version ${magentoVersion}`);
        }

        const {
            overridenConfiguration,
            userConfiguration
        } = await resolveConfigurationWithOverrides(
            configurations[magentoVersion],
            newBaseConfig,
            projectPath
        );

        return {
            php: getPhpConfig(overridenConfiguration.configuration, newBaseConfig),
            docker: await getDockerConfig(ctx, overridenConfiguration, newBaseConfig),
            magentoConfiguration: getMagentoConfig(overridenConfiguration.magento),
            baseConfig: newBaseConfig,
            overridenConfiguration,
            userConfiguration,
            nonOverridenConfiguration: configurations[magentoVersion]
        };
    },
    baseConfig,
    getBaseConfig,
    magento,
    platforms,
    darwinMinimalVersion,
    defaultConfiguration
};
