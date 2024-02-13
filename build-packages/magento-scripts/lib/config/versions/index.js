const path = require('path')
const fs = require('fs')
const { deepmerge } = require('../../util/deepmerge')
const { defaultMagentoConfig } = require('../magento-config')

/**
 * @type {Partial<Omit<import('../../../typings').CMAConfiguration, 'configuration'>> & { configuration: Partial<import('../../../typings').CMAConfiguration['configuration']> }}}
 */
const defaultCMAConfig = {
    prefix: true,
    configuration: {
        newRelic: {
            enabled: false,
            agentVersion: '10.11.0.3'
        }
    },
    magento: defaultMagentoConfig,
    ssl: {
        enabled: false,
        external_provider: false
    },
    storeDomains: {
        admin: 'localhost'
    }
}

const magentoVersions = fs
    .readdirSync(__dirname, {
        withFileTypes: true
    })
    .filter((f) => f.isFile())
    .filter((f) => f.name.includes('magento'))
    .map((f) => require(path.join(__dirname, f.name)))

const getConfigurations = (config = {}) =>
    magentoVersions.reduce(
        (acc, val) => ({
            ...acc,
            [val({}).magentoVersion]: deepmerge(defaultCMAConfig, {
                ...val(config)
            })
        }),
        {}
    )

const allVersions = Object.entries(getConfigurations())
    .map(([name, magentoConfig]) => ({ ...magentoConfig, name }))
    .sort((a, b) => a.magentoVersion.localeCompare(b.magentoVersion))
    .reverse()

module.exports = {
    allVersions,
    getConfigurations,
    defaultConfiguration: allVersions.find((config) => config.isDefault),
    defaultCMAConfig
}
