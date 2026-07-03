const fs = require('fs')

/**
 * @param {string} path
 * @returns {boolean}
 */
const pathExistsSync = (path) => {
    try {
        fs.accessSync(path, fs.constants.F_OK)
    } catch {
        return false
    }

    return true
}

module.exports = pathExistsSync
