const { execAsyncSpawn } = require('./exec-async-command');

/**
 * @param {String} cmd
 * @param {String} serviceName
 * @param {{ now: boolean }} options
 */
const run = (cmd, serviceName, options = {}) => execAsyncSpawn(
    `systemctl ${ cmd }${ serviceName ? ` ${ serviceName }` : '' }${ options.now ? ' --now' : ''}`,
    {
        withCode: true
    }
);

const daemonReload = () => run('daemon-reload');

const systemctlControl = (serviceName) => ({
    disable: () => run('disable', serviceName),
    enable: () => run('enable', serviceName),
    enableAndStart: () => run('enable', serviceName, { now: true }),
    restart: () => run('restart', serviceName),
    start: () => run('start', serviceName),
    stop: () => run('stop', serviceName),
    isEnabled: async () => {
        try {
            const { result } = await run('is-enabled', serviceName);
            return result.includes('enabled');
        } catch (e) {
            return false;
        }
    },
    isRunning: async () => {
        try {
            const { result } = await run('status', serviceName);

            return result.includes('active (running)');
        } catch (e) {
            return false;
        }
    }
});

module.exports = {
    systemctlControl,
    daemonReload
};
