const path = require('path')
const fs = require('fs')
const semver = require('semver')
const { deepmerge } = require('../../util/deepmerge')

const defaultCMAConfig = {
    prefix: true
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
    .sort((a, b) => {
        if (
            a.magentoVersion.replace(/-p[0-9]+$/i, '') ===
            b.magentoVersion.replace(/-p[0-9]+$/i, '')
        ) {
            if (
                a.magentoVersion.includes('-p') &&
                !b.magentoVersion.includes('-p')
            ) {
                return 1
            }
            const aPatchVersion =
                (a.magentoVersion.includes('-p') &&
                    Number.parseInt(
                        a.magentoVersion.match(/-p([0-9]+)$/i)[1],
                        10
                    )) ||
                0
            const bPatchVersion =
                (b.magentoVersion.includes('-p') &&
                    Number.parseInt(
                        b.magentoVersion.match(/-p([0-9]+)$/i)[1],
                        10
                    )) ||
                0

            return aPatchVersion - bPatchVersion
        }

        return semver.gt(a.magentoVersion, b.magentoVersion) ? 1 : -1
    })
    .reverse()

module.exports = {
    allVersions,
    getConfigurations,
    defaultConfiguration: allVersions.find((config) => config.isDefault),
    defaultCMAConfig
}
