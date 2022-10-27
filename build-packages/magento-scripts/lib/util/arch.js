const macosVersion = require('macos-version')
const { execSync } = require('child_process')
const { execAsync } = require('./exec-async')

/**
 * Get actual system arch
 * @returns {Promise<NodeJS.Architecture>}
 */
const getArch = async () => {
    if (macosVersion.isMacOS) {
        if (process.arch === 'arm64') {
            return 'arm64'
        }

        const result = (
            await execAsync('sysctl -in sysctl.proc_translated')
        ).trim()

        if (result === '1') {
            return 'arm64'
        }

        return 'x64'
    }

    return process.arch
}

/**
 * Get actual system arch synchronously
 * @returns {NodeJS.Architecture}
 */
const getArchSync = () => {
    if (macosVersion.isMacOS) {
        if (process.arch === 'arm64') {
            return 'arm64'
        }

        const result = execSync('sysctl -in sysctl.proc_translated', {
            encoding: 'utf-8'
        }).trim()

        if (result === '1') {
            return 'arm64'
        }

        return 'x64'
    }

    return process.arch
}

module.exports = {
    getArch,
    getArchSync
}
