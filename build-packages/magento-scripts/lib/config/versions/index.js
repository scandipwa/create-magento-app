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
        },
        searchengine: 'elasticsearch'
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

/**
 * @returns {Record<string, ReturnType<import('../../../typings/common').MagentoVersionConfigurationFunction>>}
 */
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
    .sort((a, b) => {
        // Splitting the version strings into major, minor, and patch numbers
        const [versionA, patchA] = a.magentoVersion.split('-')
        const [versionB, patchB] = b.magentoVersion.split('-')

        const [majorA, minorA, patchNumberA] = versionA.split('.').map(Number)
        const [majorB, minorB, patchNumberB] = versionB.split('.').map(Number)

        // Comparing major versions
        if (majorA !== majorB) {
            return majorA - majorB
        }
        // Comparing minor versions
        if (minorA !== minorB) {
            return minorA - minorB
        }
        // Comparing patch numbers
        if (patchNumberA !== patchNumberB) {
            return patchNumberA - patchNumberB
        }

        // Comparing patch versions (if present)
        if (patchA && patchB) {
            const patchNumberA = Number(patchA.replace('p', ''))
            const patchNumberB = Number(patchB.replace('p', ''))
            return patchNumberA - patchNumberB
        }

        // Sorting versions with patch against versions without patch
        if (patchA && !patchB) {
            return -1
        }

        if (!patchA && patchB) {
            return 1
        }

        // Versions are equal
        return 0
    })
    .reverse()

module.exports = {
    allVersions,
    getConfigurations,
    defaultConfiguration: allVersions.find((config) => config.isDefault),
    defaultCMAConfig
}
