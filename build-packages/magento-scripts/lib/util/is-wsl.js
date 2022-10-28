const os = require('os')
const fs = require('fs')

/**
 * Checks if process is running in wsl mode
 * @returns {Promise<boolean>}
 */
const getIsWsl = async () => {
    if (process.platform !== 'linux') {
        return false
    }

    if (typeof process.env.WSL_DISTRO_NAME === 'string') {
        return true
    }

    if (os.release().toLowerCase().includes('microsoft')) {
        return true
    }

    try {
        const procVersion = await fs.promises.readFile('/proc/version', 'utf8')

        return procVersion.toLowerCase().includes('microsoft')
    } catch (e) {
        return false
    }
}

module.exports = getIsWsl
