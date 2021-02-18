const path = require('path');
const getDockerConfig = require('./docker');
const {
    getConfigurations,
    defaultConfiguration
} = require('./versions');
const getPhpConfig = require('./php');
const getComposerConfig = require('./composer');
const { getMagentoConfig } = require('./magento-config');
const resolveConfigurationWithOverrides = require('../util/resolve-configuration-with-overrides');
const { getPrefix } = require('../util/prefix');

const platforms = ['linux', 'darwin'];
const darwinMinimalVersion = '10.5';

const getBaseConfig = () => ({
    prefix: getPrefix(),
    magentoDir: process.cwd(),
    templateDir: path.join(__dirname, 'templates'),
    cacheDir: path.join(process.cwd(), 'node_modules', '.create-magento-app-cache')
});

const baseConfig = getBaseConfig();

const magento = {
    binPath: path.join(baseConfig.magentoDir, 'bin', 'magento')
};

module.exports = {
    async getConfigFromMagentoVersion(magentoVersion) {
        const newBaseConfig = getBaseConfig();
        const configurations = getConfigurations(newBaseConfig);
        if (!configurations[magentoVersion]) {
            throw new Error(`No config found for magento version ${magentoVersion}`);
        }

        const {
            overridenConfiguration,
            userConfiguration
        } = await resolveConfigurationWithOverrides(configurations[magentoVersion], newBaseConfig);

        return {
            php: getPhpConfig(overridenConfiguration.configuration, newBaseConfig),
            docker: getDockerConfig(overridenConfiguration, newBaseConfig),
            composer: getComposerConfig(overridenConfiguration.configuration, newBaseConfig),
            magentoConfiguration: getMagentoConfig(overridenConfiguration.magento),
            baseConfig: newBaseConfig,
            overridenConfiguration,
            userConfiguration,
            nonOverridenConfiguration: configurations[magentoVersion]
        };
    },
    baseConfig,
    magento,
    platforms,
    docker: getDockerConfig(defaultConfiguration, baseConfig),
    darwinMinimalVersion,
    defaultConfiguration
};
