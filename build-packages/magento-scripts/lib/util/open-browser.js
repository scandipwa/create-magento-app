const { execAsync } = require('./exec-async')

/**
 * @param {string} url
 */
const openBrowser = async (url) => {
    const start = process.platform === 'darwin' ? 'open' : 'xdg-open'

    await execAsync(`${start} ${url}`)
}

module.exports = openBrowser
