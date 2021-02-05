const magento241 = require('./magento-2.4.1');

const getConfigurations = (config = {}) => ({
    '2.4.1': {
        isDefault: true,
        magentoVersion: magento241().magentoVersion,
        magento: magento241().magento,
        configuration: magento241(config).configuration
    }
});

module.exports = {
    allVersions: Object.values(getConfigurations()),
    getConfigurations,
    defaultConfiguration: Object.values(getConfigurations()).find((config) => config.isDefault)
};
