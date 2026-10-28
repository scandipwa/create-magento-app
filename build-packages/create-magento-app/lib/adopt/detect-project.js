const path = require('path')
const fs = require('fs')
const pathExists = require('../path-exists')

const magentoEditions = [
    'magento/product-community-edition',
    'magento/product-enterprise-edition'
]

/**
 * Read and parse a JSON file, returning null when it is missing or malformed.
 * @param {string} pathname
 * @returns {Promise<any | null>}
 */
const readJson = async (pathname) => {
    try {
        return JSON.parse(await fs.promises.readFile(pathname, 'utf-8'))
    } catch (e) {
        return null
    }
}

/**
 * A destination counts as "existing" when there is something in it we could
 * destroy. An empty (or absent) directory is a plain new-project scaffold.
 * @param {string} destination
 * @returns {Promise<boolean>}
 */
const isNonEmptyDirectory = async (destination) => {
    if (!(await pathExists(destination))) {
        return false
    }

    const stat = await fs.promises.stat(destination)

    if (!stat.isDirectory()) {
        return false
    }

    const entries = await fs.promises.readdir(destination)

    return entries.length > 0
}

/**
 * @typedef {Object} ProjectDescriptor
 * @property {boolean} isExisting destination already holds files
 * @property {boolean} isMagento destination looks like a Magento 2 root
 * @property {any | null} packageJson parsed package.json, if any
 * @property {any | null} composerJson parsed composer.json, if any
 * @property {string | null} magentoEdition edition found in composer.json
 */

/**
 * Inspect the destination so the caller can decide between scaffolding a new
 * project and adopting an existing one.
 * @param {string} destination absolute path
 * @returns {Promise<ProjectDescriptor>}
 */
const detectProject = async (destination) => {
    const isExisting = await isNonEmptyDirectory(destination)

    if (!isExisting) {
        return {
            isExisting: false,
            isMagento: false,
            packageJson: null,
            composerJson: null,
            magentoEdition: null
        }
    }

    const [packageJson, composerJson, hasMagentoBinary, hasAppEtc] =
        await Promise.all([
            readJson(path.join(destination, 'package.json')),
            readJson(path.join(destination, 'composer.json')),
            pathExists(path.join(destination, 'bin', 'magento')),
            pathExists(path.join(destination, 'app', 'etc'))
        ])

    const composerRequire =
        (composerJson &&
            (composerJson.require || composerJson['require-dev'])) ||
        {}

    const magentoEdition =
        magentoEditions.find((edition) => composerRequire[edition]) || null

    return {
        isExisting: true,
        isMagento: Boolean(magentoEdition) || (hasMagentoBinary && hasAppEtc),
        packageJson,
        composerJson,
        magentoEdition
    }
}

module.exports = {
    detectProject,
    magentoEditions
}
