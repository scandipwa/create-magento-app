const { nameKey } = require('../keys')

const PHP_DEBUG_GENERAL_COMPONENT_NAME = 'PhpDebugGeneral'

const portKey = '@_port'
const xdebugDebugPortKey = '@_xdebug_debug_port'
const ignoreConnectionsThroughUnregisteredServersKey =
    '@_ignore_connections_through_unregistered_servers'

/**
 * @param {Array} workspaceConfigs
 * @param {import('../../../../../typings/context').ListrContext} ctx
 * @returns {Promise<Boolean>}
 */
const setupPHPDebugGeneral = async (workspaceConfigs, ctx) => {
    const { ports } = ctx

    const xdebugPort = `${ports.xdebug}`

    let hasChanges = false
    const phpDebugGeneralComponent = workspaceConfigs.find(
        (workspaceConfig) =>
            workspaceConfig[nameKey] === PHP_DEBUG_GENERAL_COMPONENT_NAME
    )

    if (phpDebugGeneralComponent) {
        if (
            phpDebugGeneralComponent.xdebug_debug_ports &&
            !Array.isArray(phpDebugGeneralComponent.xdebug_debug_ports)
        ) {
            hasChanges = true
            phpDebugGeneralComponent.xdebug_debug_ports = [
                phpDebugGeneralComponent.xdebug_debug_ports
            ]
        } else if (!phpDebugGeneralComponent.xdebug_debug_ports) {
            hasChanges = true
            phpDebugGeneralComponent.xdebug_debug_ports = []
        }

        if (!(xdebugDebugPortKey in phpDebugGeneralComponent)) {
            hasChanges = true
            phpDebugGeneralComponent[xdebugDebugPortKey] = xdebugPort
        }

        if (phpDebugGeneralComponent[xdebugDebugPortKey] !== xdebugPort) {
            hasChanges = true
            phpDebugGeneralComponent[xdebugDebugPortKey] = xdebugPort
        }

        if (
            !phpDebugGeneralComponent.xdebug_debug_ports.some(
                (xPort) => xPort[portKey] === xdebugPort
            )
        ) {
            hasChanges = true
            phpDebugGeneralComponent.xdebug_debug_ports.push({
                [portKey]: xdebugPort
            })
        }
    } else {
        hasChanges = true
        workspaceConfigs.push({
            [nameKey]: PHP_DEBUG_GENERAL_COMPONENT_NAME,
            [xdebugDebugPortKey]: xdebugPort,
            [ignoreConnectionsThroughUnregisteredServersKey]: 'true',
            xdebug_debug_ports: [
                {
                    [portKey]: xdebugPort
                }
            ]
        })
    }

    return hasChanges
}

module.exports = setupPHPDebugGeneral
