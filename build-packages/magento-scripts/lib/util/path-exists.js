const fs = require('fs')

/**
 * Check if provided path exists in filesystem
 * @param {string} path
 * @returns {Promise<boolean>}
 */
const pathExists = async (path) => {
    try {
        await fs.promises.access(path, fs.constants.F_OK)
    } catch {
        return false
    }

    return true
}

module.exports = pathExists
