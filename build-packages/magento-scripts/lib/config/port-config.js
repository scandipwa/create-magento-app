const fs = require('fs')
const path = require('path')
const { findAPortNotInUse } = require('../util/portscanner')
const { baseConfig } = require('.')
const { deepmerge } = require('../util/deepmerge')
const getJsonfileData = require('../util/get-jsonfile-data')
const { getProjects } = require('./config')

/**
 * Get ports that are used by other CMA instances
 * @returns {Promise<number[]>}
 */
const getUsedByOtherCMAProjectsPorts = async () => {
    const portConfigs = await Promise.all(
        Object.keys(getProjects())
            .filter((projectPath) => projectPath !== process.cwd())
            .map((projectPath) =>
                getJsonfileData(
                    path.join(
                        projectPath,
                        'node_modules',
                        '.create-magento-app-cache',
                        'port-config.json'
                    )
                )
            )
    )

    const mappedPorts = portConfigs
        .filter(Boolean)
        .map((portConfig) => Object.values(portConfig))

    return Array.from(
        new Set(mappedPorts.reduce((acc, val) => acc.concat(val), []))
    )
}

/**
 * @param {Number} port
 * @param {Object} [options]
 * @param {Number[]} [options.portIgnoreList]
 * @returns {Promise<number | false>}
 */
const getPort = async (port, options = {}) => {
    const { portIgnoreList = [] } = options
    const startPort = port
    const endPort = port + 999

    const availablePort = await findAPortNotInUse({
        startPort,
        endPort,
        portIgnoreList
    })

    return availablePort
}

/**
 * @param {Record<string, number>} ports
 */
const savePortsConfig = async (ports) => {
    await fs.promises.writeFile(
        path.join(baseConfig.cacheDir, 'port-config.json'),
        JSON.stringify(ports, null, 2),
        { encoding: 'utf8' }
    )
}

// Map of default ports (key:value)
const defaultPorts = {
    app: 3031,
    varnish: 8080,
    sslTerminator: 80,
    fpm: 9000,
    mariadb: 3306,
    redis: 6379,
    elasticsearch: 9200,
    maildevSMTP: 1025,
    maildevWeb: 1080
}

/**
 * Get available port configuration
 * @param {Record<string, number>} ports
 * @param {Object} [options]
 * @param {boolean} [options.useNonOverlappingPorts]
 * @returns {Promise<Record<string, number>>}
 */
const getPortsConfig = async (ports, options = {}) => {
    const { useNonOverlappingPorts } = options
    const mergedPorts = deepmerge(defaultPorts, ports || {})
    /**
     * @type {number[]}
     */
    let p = []

    if (useNonOverlappingPorts) {
        p = p.concat(await getUsedByOtherCMAProjectsPorts())
    }
    const availablePorts = Object.fromEntries(
        await Promise.all(
            Object.entries(mergedPorts).map(async ([name, port]) => {
                const availablePort = await getPort(port, {
                    portIgnoreList: p
                })

                return [name, availablePort]
            })
        )
    )

    return availablePorts
}

module.exports = {
    defaultPorts,
    getPortsConfig,
    getPort,
    savePortsConfig
}
