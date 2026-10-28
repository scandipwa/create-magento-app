const path = require('path')

/**
 * Resolve the folder name a destination points at. Handles `.`, `./`, trailing
 * separators and nested paths, all of which a naive split on the separator gets
 * wrong.
 * @param {string} destination
 * @returns {string}
 */
const getProjectName = (destination) =>
    path.basename(path.resolve(process.cwd(), destination))

/**
 * npm rejects names with uppercase letters or characters that are not URL-safe,
 * and an adopted folder is named by whoever cloned it — not by us.
 * @param {string} name
 * @returns {string}
 */
const toPackageName = (name) => {
    const normalized = name
        .toLowerCase()
        .replace(/[^a-z0-9-._~]/g, '-')
        .replace(/^[._]+/, '')

    return normalized || 'magento-app'
}

module.exports = {
    getProjectName,
    toPackageName
}
