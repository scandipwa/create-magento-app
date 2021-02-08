const { getConfigFromMagentoVersion } = require('.');
const { getPort } = require('./port-config');

/**
 * Get available ports on the system
 */
const getAvailablePorts = {
    title: 'Get available ports',
    task: async (ctx) => {
        const { magentoVersion } = ctx;
        const { ports: availablePorts } = await getConfigFromMagentoVersion(magentoVersion);

        if (ctx.port) {
            const isPortAvailable = (await getPort(ctx.port)) === ctx.port;
            if (!isPortAvailable) {
                throw new Error(`Port ${ctx.port} is not available`);
            } else {
                availablePorts.app = ctx.port;
            }
        }

        // eslint-disable-next-line no-param-reassign
        ctx.ports = availablePorts;
    }
};

const getCachedPorts = {
    title: 'Get cached ports',
    task: async (ctx) => {
        const { ports } = ctx.config.overridenConfiguration;

        // eslint-disable-next-line no-param-reassign
        ctx.ports = ports;
    }
};

module.exports = {
    getAvailablePorts,
    getCachedPorts
};
