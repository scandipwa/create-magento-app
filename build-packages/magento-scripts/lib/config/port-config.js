const portscanner = require('portscanner');
const deepmerge = require('../util/deepmerge');

/**
 * @param {Number} port
 * @returns {Promise<Number>}
 */
const getPort = async (port) => portscanner.findAPortNotInUse(port, port + 999);

// Map of default ports (key:value)
const defaultPorts = {
    app: 80,
    fpm: 9000,
    xdebug: 9111,
    mysql: 3306,
    redis: 6379,
    elasticsearch: 9200
};

/**
 * Get available port configuration
 * @param {Record<string, number>} ports
 * @returns {Promise<Record<string, number>>}
 */
const getPortsConfig = async (ports) => {
    const mergedPorts = deepmerge(defaultPorts, ports || {});
    const availablePorts = Object.fromEntries(await Promise.all(
        Object.entries(mergedPorts).map(async ([name, port]) => {
            const availablePort = await getPort(port);
            return [name, availablePort];
        })
    ));

    return availablePorts;
};

module.exports = {
    defaultPorts,
    getPortsConfig,
    getPort
};
