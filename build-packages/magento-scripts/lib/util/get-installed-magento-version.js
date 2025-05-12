const fs = require('fs')
const path = require('path')
const KnownError = require('../errors/known-error')
const pathExists = require('./path-exists')

/**
 * @param {string} composerPath
 * @returns {Promise<{ require: Record<string, string> } | null>}
 */
const getComposerData = async (composerPath) => {
    const composerExists = await pathExists(composerPath)

    if (!composerExists) {
        return null
    }

    return JSON.parse(await fs.promises.readFile(composerPath, 'utf-8'))
}

/**
 * @param {string} composerLockPath
 * @returns {Promise<{ packages: Array<{ name: string, version: string }> } | null>}
 */
const getComposerLockData = async (composerLockPath) => {
    const composerExists = await pathExists(composerLockPath)

    if (!composerExists) {
        return null
    }

    return JSON.parse(await fs.promises.readFile(composerLockPath, 'utf-8'))
}

const getInstalledMagentoVersionFromLock = async (
    projectPath = process.cwd()
) => {
    const composerLockData = await getComposerLockData(
        path.join(projectPath, 'composer.lock')
    )

    if (!composerLockData) {
        throw new KnownError('composer.lock not found')
    }

    const magentoDependency = composerLockData.packages.find(
        (composerLockPackage) => {
            return [
                'magento/product-community-edition',
                'magento/product-enterprise-edition'
            ].some(
                (magentoEdition) => composerLockPackage.name === magentoEdition
            )
        }
    )

    if (!magentoDependency) {
        return null
    }

    return magentoDependency.version
}

const getInstalledMagentoVersion = async (projectPath = process.cwd()) => {
    const composerData = await getComposerData(
        path.join(projectPath, 'composer.json')
    )

    if (!composerData) {
        throw new KnownError('composer.json not found')
    }
    const magentoDependency = [
        'magento/product-community-edition',
        'magento/product-enterprise-edition'
    ].find((magentoEdition) => composerData.require[magentoEdition])

    let foundMagentoVersion = ''

    if (!magentoDependency) {
        const magentoLockVersion = await getInstalledMagentoVersionFromLock(
            projectPath
        )
        if (!magentoLockVersion) {
            if (!magentoDependency) {
                throw new KnownError(
                    'No Magento dependency found in composer.json or composer.lock'
                )
            }
        } else {
            foundMagentoVersion = magentoLockVersion
        }
    } else {
        foundMagentoVersion = composerData.require[magentoDependency]
    }

    return foundMagentoVersion.replace(/\^/i, '')
}

module.exports = getInstalledMagentoVersion
