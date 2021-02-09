const fs = require('fs');
const path = require('path');
const { baseConfig } = require('.');
const pathExists = require('../util/path-exists');
const {
    getPort,
    getPortsConfig,
    defaultPorts
} = require('./port-config');

const portConfigPath = path.join(baseConfig.cacheDir, 'port-config.json');

/**
 * Get available ports on the system
 */
const getAvailablePorts = {
    title: 'Get available ports',
    task: async (ctx) => {
        let ports;

        if (await pathExists(portConfigPath)) {
            ports = JSON.parse(
                await fs.promises.readFile(
                    portConfigPath,
                    'utf-8'
                )
            );
        } else {
            ports = { ...defaultPorts };
        }
        const availablePorts = await getPortsConfig(ports);

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
        let ports;

        if (await pathExists(portConfigPath)) {
            ports = JSON.parse(
                await fs.promises.readFile(
                    portConfigPath,
                    'utf-8'
                )
            );
        } else {
            ports = { ...defaultPorts };
        }

        // eslint-disable-next-line no-param-reassign
        ctx.ports = ports;
    }
};

module.exports = {
    getAvailablePorts,
    getCachedPorts
};
