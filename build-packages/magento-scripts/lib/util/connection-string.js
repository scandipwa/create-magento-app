/**
 * @typedef ParsedConnection
 * @prop {String} protocol
 * @prop {String} [user]
 * @prop {String} [password]
 * @prop {String} [port]
 * @prop {String} host
 * @prop {String} [hostname]
 * @prop {String[]} [segments]
 * @prop {Record<string, string>} params
 */

/**
 * @param {String} url
 * @returns {ParsedConnection}
 */
const connectionStringParser = (url) => {
    const pattern =
        /^(?:([^:/?#\s]+):\/{2})?(?:([^@/?#\s]+)@)?([^/?#\s]+)?(?:\/([^?#\s]*))?(?:[?]([^#\s]+))?\S*$/
    const matches = url.match(pattern)

    if (!matches) {
        return {
            host: '',
            params: {},
            protocol: ''
        }
    }
    /**
     * @type {Record<string, string>}
     */
    const params = {}
    if (matches && matches[5] !== undefined) {
        matches[5].split('&').forEach((x) => {
            const a = x.split('=')
            params[a[0]] = a[1]
        })
    }

    return {
        protocol: matches[1],
        user: matches[2] !== undefined ? matches[2].split(':')[0] : undefined,
        password:
            matches[2] !== undefined ? matches[2].split(':')[1] : undefined,
        host: matches[3],
        hostname:
            matches[3] !== undefined
                ? matches[3].split(/:(?=\d+$)/)[0]
                : undefined,
        port:
            matches[3] !== undefined
                ? matches[3].split(/:(?=\d+$)/)[1]
                : undefined,
        segments: matches[4] !== undefined ? matches[4].split('/') : undefined,
        params
    }
}

/**
 * @param {ParsedConnection} options
 * @returns {String}
 */
const connectionStringBuilder = (options) => {
    const { protocol, user, password, host, port, segments, params } = options

    return `${protocol}://${
        user && password ? `${user}:${password}@` : ''
    }${host}${port ? `:${port}` : ''}/${
        segments && segments.length > 0 ? segments.join('/') : ''
    }${new URLSearchParams(params).toString()}`
}

module.exports = {
    connectionStringParser,
    connectionStringBuilder
}
