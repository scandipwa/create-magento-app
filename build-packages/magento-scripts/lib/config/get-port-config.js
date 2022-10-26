const fs = require('fs')
const path = require('path')
const { baseConfig } = require('.')
const KnownError = require('../errors/known-error')
const pathExists = require('../util/path-exists')
const { getPort, getPortsConfig, defaultPorts } = require('./port-config')

const portConfigPath = path.join(baseConfig.cacheDir, 'port-config.json')

/**
 * Get available ports on the system
 * @returns {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const getAvailablePorts = () => ({
    title: 'Getting available ports',
    task: async (ctx) => {
        let ports = { ...defaultPorts }

        if (await pathExists(portConfigPath)) {
            ports = JSON.parse(
                await fs.promises.readFile(portConfigPath, 'utf-8')
            )
            if (!ports.sslTerminator) {
                ports.sslTerminator = ports.app
                ports.app = defaultPorts.app
            }
        }
        const {
            systemConfiguration: { useNonOverlappingPorts }
        } = ctx
        const availablePorts = await getPortsConfig(ports, {
            useNonOverlappingPorts
        })

        if (ctx.port) {
            const isPortAvailable = (await getPort(ctx.port)) === ctx.port
            if (!isPortAvailable) {
                throw new KnownError(`Port ${ctx.port} is not available`)
            } else {
                availablePorts.sslTerminator = ctx.port
            }
        }

        ctx.ports = availablePorts
    }
})

/**
 * @returns {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const getCachedPorts = () => ({
    title: 'Getting cached ports',
    task: async (ctx) => {
        let ports

        if (await pathExists(portConfigPath)) {
            ports = JSON.parse(
                await fs.promises.readFile(portConfigPath, 'utf-8')
            )
            ctx.cachedPorts = { ...ports }
        } else {
            ports = { ...defaultPorts }
        }

        ctx.ports = ports
    }
})

module.exports = {
    getAvailablePorts,
    getCachedPorts
}
