const { execAsync } = require('./exec-async')

const isCMANoOpen =
    process.env.CMA_NO_OPEN === '1' || process.env.CMA_NO_OPEN === 'true'

// eslint-disable-next-line no-control-regex
const consoleStyleReplacer = /[\u001b]\[\S+?m/g
/**
 * @param {string} url
 */
const openBrowser = async (url) => {
    if (isCMANoOpen) {
        return
    }

    const start = process.platform === 'darwin' ? 'open' : 'xdg-open'

    await execAsync(`${start} ${url.replace(consoleStyleReplacer, '')}`)
}

module.exports = openBrowser
