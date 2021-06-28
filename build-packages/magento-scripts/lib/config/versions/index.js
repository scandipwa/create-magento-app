const deepmerge = require('../../util/deepmerge');
const magento235 = require('./magento-2.3.5');
const magento241 = require('./magento-2.4.1');
const magento241p1 = require('./magento-2.4.1-p1');
const magento242 = require('./magento-2.4.2');

const defaultCMAConfig = {
    prefix: true
};

const getConfigurations = (config = {}) => ({
    '2.3.5': deepmerge(defaultCMAConfig, {
        ...magento235(config)
    }),
    '2.4.1': deepmerge(defaultCMAConfig, {
        isDefault: true,
        ...magento241(config)
    }),
    '2.4.1-p1': deepmerge(defaultCMAConfig, {
        ...magento241p1(config)
    }),
    '2.4.2': deepmerge(defaultCMAConfig, {
        ...magento242(config)
    })
});

const allVersions = Object.entries(getConfigurations()).map(([name, magentoConfig]) => ({ ...magentoConfig, name }));
module.exports = {
    allVersions,
    getConfigurations,
    defaultConfiguration: allVersions.find((config) => config.isDefault),
    defaultCMAConfig
};
