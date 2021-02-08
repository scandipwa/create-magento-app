const path = require('path');
const getDockerConfig = require('./docker');
const {
    getConfigurations,
    defaultConfiguration
} = require('./versions');
const getPhpConfig = require('./php');
const getComposerConfig = require('./composer');
const resolveConfigurationWithOverrides = require('../util/resolve-configuration-with-overrides');
const { getMagentoConfig } = require('./magento-config');
const { getPortsConfig } = require('./port-config');

const platforms = ['linux', 'darwin'];
const darwinMinimalVersion = '10.5';

const baseConfig = {
    // TODO: get more unique prefix
    prefix: path.parse(process.cwd()).name,
    magentoDir: process.cwd(),
    templateDir: path.join(__dirname, 'templates'),
    cacheDir: path.join(process.cwd(), 'node_modules', '.create-magento-app-cache')
};

const magento = {
    binPath: path.join(baseConfig.magentoDir, 'bin', 'magento')
};

module.exports = {
    async getConfigFromMagentoVersion(magentoVersion) {
        const configurations = getConfigurations(baseConfig);
        if (!configurations[magentoVersion]) {
            throw new Error(`No config found for magento version ${magentoVersion}`);
        }

        const {
            overridenConfiguration,
            userConfiguration
        } = await resolveConfigurationWithOverrides(configurations[magentoVersion]);

        return {
            php: getPhpConfig(overridenConfiguration.configuration, baseConfig),
            docker: getDockerConfig(overridenConfiguration.configuration, baseConfig),
            composer: getComposerConfig(overridenConfiguration.configuration, baseConfig),
            magentoConfiguration: getMagentoConfig(overridenConfiguration.magento),
            ports: await getPortsConfig(overridenConfiguration.ports),
            baseConfig,
            overridenConfiguration,
            userConfiguration,
            nonOverridenConfiguration: configurations[magentoVersion]
        };
    },
    baseConfig,
    magento,
    platforms,
    docker: getDockerConfig(defaultConfiguration.configuration, baseConfig),
    darwinMinimalVersion,
    defaultConfiguration
};
