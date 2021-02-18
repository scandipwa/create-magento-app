const deepmerge = require('../../util/deepmerge');
const magento241 = require('./magento-2.4.1');

const defaultCMAConfig = {
    prefix: true
};

const getConfigurations = (config = {}) => ({
    '2.4.1': deepmerge(defaultCMAConfig, {
        isDefault: true,
        ...magento241(config)
    })
});

module.exports = {
    allVersions: Object.values(getConfigurations()),
    getConfigurations,
    defaultConfiguration: Object.values(getConfigurations()).find((config) => config.isDefault),
    defaultCMAConfig
};
