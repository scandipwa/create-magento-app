const { request } = require('smol-request')

const ipRegex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

/**
 * @param {string} text
 */
const isIpAddress = (text) => ipRegex.test(text)

const externalIpProviders = [
    'http://api.ipify.org/',
    'http://icanhazip.com/',
    'http://ifconfig.io/ip',
    'http://ip.appspot.com/',
    'http://ident.me/',
    'http://whatismyip.akamai.com/',
    'http://tnx.nl/ip',
    'http://myip.dnsomatic.com/',
    'http://ipecho.net/plain',
    'http://diagnostic.opendns.com/myip',
    'http://trackip.net/ip'
]

/**
 * Get an external IP address
 * @returns {Promise<string>}
 */
const getExternalIpAddress = async () => {
    let ip

    for (const ipProvider of externalIpProviders) {
        try {
            const response = await request(ipProvider, {
                responseType: 'text'
            })

            if (response.status === 200) {
                ip = response.data
                break
            }
        } catch (e) {
            //
        }
    }

    if (!ip) {
        throw new Error('External IP address is not available!')
    }

    return ip
}

module.exports = {
    ipRegex,
    isIpAddress,
    getExternalIpAddress
}
