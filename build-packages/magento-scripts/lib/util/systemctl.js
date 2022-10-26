const { execAsyncSpawn } = require('./exec-async-command')

/**
 * @param {string} cmd
 * @param {string} [serviceName]
 * @param {{ now?: boolean, user?: boolean }} options
 */
const run = (cmd, serviceName, options = {}) =>
    execAsyncSpawn(
        `systemctl ${options.user ? '--user ' : ''}${cmd}${
            serviceName ? ` ${serviceName}` : ''
        }${options.now ? ' --now' : ''}`,
        {
            withCode: true
        }
    )

const daemonReload = () => run('daemon-reload')

/**
 * @param {String} serviceName
 * @param {{ now?: boolean, user?: boolean }} [defaultOptions]
 */
const systemctlControl = (serviceName, defaultOptions = {}) => ({
    /**
     * @param {{ now?: boolean, user?: boolean }} [options]
     */
    disable: (options = {}) =>
        run('disable', serviceName, { ...defaultOptions, ...options }),
    /**
     * @param {{ now?: boolean, user?: boolean }} [options]
     */
    enable: (options = {}) =>
        run('enable', serviceName, { ...defaultOptions, ...options }),
    /**
     * @param {{ now?: boolean, user?: boolean }} [options]
     */
    enableAndStart: (options = {}) =>
        run('enable', serviceName, {
            now: true,
            ...defaultOptions,
            ...options
        }),
    /**
     * @param {{ now?: boolean, user?: boolean }} [options]
     */
    restart: (options = {}) =>
        run('restart', serviceName, { ...defaultOptions, ...options }),
    /**
     * @param {{ now?: boolean, user?: boolean }} [options]
     */
    start: (options = {}) =>
        run('start', serviceName, { ...defaultOptions, ...options }),
    /**
     * @param {{ now?: boolean, user?: boolean }} [options]
     */
    stop: (options = {}) =>
        run('stop', serviceName, { ...defaultOptions, ...options }),
    /**
     * @param {{ now?: boolean, user?: boolean }} [options]
     */
    isEnabled: async (options = {}) => {
        try {
            const { result } = await run('is-enabled', serviceName, {
                ...defaultOptions,
                ...options
            })
            return result.includes('enabled')
        } catch (e) {
            return false
        }
    },
    /**
     * @param {{ now?: boolean, user?: boolean }} [options]
     */
    isRunning: async (options = {}) => {
        try {
            const { result } = await run('status', serviceName, {
                ...defaultOptions,
                ...options
            })

            return result.includes('active (running)')
        } catch (e) {
            return false
        }
    },
    /**
     * @param {{ user?: boolean }} [options]
     */
    exists: async (options = {}) => {
        const optionsToUse = { ...defaultOptions, ...options }
        try {
            const command = `if [[ $(systemctl ${
                optionsToUse.user ? '--user ' : ''
            }list-units --all -t service --full --no-legend "${serviceName}.service" | sed 's/^\\s*//g' | cut -f1 -d' ') == ${serviceName}.service ]]; then
                echo "1"
            else
                echo "0"
            fi`
            const result = await execAsyncSpawn(command)

            return result === '1'
        } catch (e) {
            return false
        }
    }
})

module.exports = {
    systemctlControl,
    daemonReload
}
