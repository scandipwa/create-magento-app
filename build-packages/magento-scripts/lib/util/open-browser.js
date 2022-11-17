const { execAsync } = require('./exec-async')

// eslint-disable-next-line no-control-regex
const consoleStyleReplacer = /[\u001b]\[\S+?m/g
/**
 * @param {string} url
 */
const openBrowser = async (url) => {
    const start = process.platform === 'darwin' ? 'open' : 'xdg-open'

    await execAsync(`${start} ${url.replace(consoleStyleReplacer, '')}`)
}

module.exports = openBrowser
