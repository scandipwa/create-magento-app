const fs = require('fs');
const path = require('path');
const { findAPortNotInUse } = require('../util/portscanner');
const { baseConfig } = require('.');
const deepmerge = require('../util/deepmerge');
const { projectsConfig } = require('./config');
const getJsonfileData = require('../util/get-jsonfile-data');

const getUsedByOtherCMAProjectsPorts = async () => {
    const portConfigs = await Promise.all(
        Object.keys(projectsConfig.store)
            .filter((projectPath) => projectPath !== process.cwd())
            .map((projectPath) => getJsonfileData(path.join(projectPath, 'node_modules', '.create-magento-app-cache', 'port-config.json')))
    );

    const mappedPorts = portConfigs.filter(Boolean).map((portConfig) => Object.values(portConfig));

    return Array.from(new Set(mappedPorts.reduce((acc, val) => acc.concat(val), [])));
};

/**
 * @param {Number} port
 * @param {Object} options
 * @param {Number[]} options.portIgnoreList
 * @returns {Promise<Number>}
 */
const getPort = async (port, options) => {
    const {
        portIgnoreList = []
    } = options;
    const startPort = port;
    const endPort = port + 999;

    const availablePort = await findAPortNotInUse({
        startPort,
        endPort,
        portIgnoreList
    });

    return availablePort;
};

const savePortsConfig = async (ports) => {
    await fs.promises.writeFile(
        path.join(baseConfig.cacheDir, 'port-config.json'),
        JSON.stringify(ports, null, 2),
        { encoding: 'utf8' }
    );
};

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
 * @param {Object} options
 * @param {Object} options.userConfiguration
 * @returns {Promise<Record<string, number>>}
 */
const getPortsConfig = async (ports, options = {}) => {
    const {
        userConfiguration
    } = options;
    const mergedPorts = deepmerge(defaultPorts, ports || {});
    let p;
    if (userConfiguration.useNonOverlappingPorts) {
        p = await getUsedByOtherCMAProjectsPorts();
    } else {
        p = [];
    }
    const availablePorts = Object.fromEntries(await Promise.all(
        Object.entries(mergedPorts).map(async ([name, port]) => {
            const availablePort = await getPort(port, {
                portIgnoreList: p
            });

            return [name, availablePort];
        })
    ));

    return availablePorts;
};

module.exports = {
    defaultPorts,
    getPortsConfig,
    getPort,
    savePortsConfig
};
