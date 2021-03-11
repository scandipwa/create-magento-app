const deepmerge = require('../../util/deepmerge');
const magento241 = require('./magento-2.4.1');
// const magento242 = require('./magento-2.4.2');

const defaultCMAConfig = {
    prefix: true,
    useNonOverlappingPorts: false
};

const getConfigurations = (config = {}) => ({
    '2.4.1': deepmerge(defaultCMAConfig, {
        isDefault: true,
        ...magento241(config)
    })
    // '2.4.2': deepmerge(defaultCMAConfig, {
    //     ...magento242(config)
    // })
});

module.exports = {
    allVersions: Object.values(getConfigurations()),
    getConfigurations,
    defaultConfiguration: Object.values(getConfigurations()).find((config) => config.isDefault),
    defaultCMAConfig
};
