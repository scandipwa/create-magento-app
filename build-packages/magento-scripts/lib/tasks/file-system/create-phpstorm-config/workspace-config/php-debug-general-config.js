const {
    nameKey
} = require('../keys');

const PHP_DEBUG_GENERAL_COMPONENT_NAME = 'PhpDebugGeneral';

const portKey = '@_port';
const xdebugDebugPortKey = '@_xdebug_debug_port';
const ignoreConnectionsThroughUnregisteredServersKey = '@_ignore_connections_through_unregistered_servers';

/**
 * @param {Array} workspaceConfigs
 * @param {ReturnType<typeof import('./workspace-config').getWorkspaceConfig>} workspaceConfig
 * @returns {Promise<Boolean>}
 */
const setupPHPDebugGeneral = async (workspaceConfigs, workspaceConfig) => {
    let hasChanges = false;
    const phpDebugGeneralComponent = workspaceConfigs.find(
        (workspaceConfig) => workspaceConfig[nameKey] === PHP_DEBUG_GENERAL_COMPONENT_NAME
    );

    if (phpDebugGeneralComponent) {
        if (phpDebugGeneralComponent.xdebug_debug_ports && !Array.isArray(phpDebugGeneralComponent.xdebug_debug_ports)) {
            hasChanges = true;
            phpDebugGeneralComponent.xdebug_debug_ports = [phpDebugGeneralComponent.xdebug_debug_ports];
        } else if (!phpDebugGeneralComponent.xdebug_debug_ports) {
            hasChanges = true;
            phpDebugGeneralComponent.xdebug_debug_ports = [];
        }

        if (!(xdebugDebugPortKey in phpDebugGeneralComponent)) {
            hasChanges = true;
            phpDebugGeneralComponent[xdebugDebugPortKey] = workspaceConfig.v3Port;
        }

        const missingXDebugPorts = [workspaceConfig.v3Port, workspaceConfig.v2Port].filter(
            (port) => !phpDebugGeneralComponent.xdebug_debug_ports.some((xPort) => xPort[portKey] === port)
        );

        if (missingXDebugPorts.length > 0) {
            hasChanges = true;
            missingXDebugPorts.forEach((port) => {
                phpDebugGeneralComponent.xdebug_debug_ports.push({
                    [portKey]: port
                });
            });
        }
    } else {
        hasChanges = true;
        workspaceConfigs.push({
            [nameKey]: PHP_DEBUG_GENERAL_COMPONENT_NAME,
            [xdebugDebugPortKey]: workspaceConfig.v3Port,
            [ignoreConnectionsThroughUnregisteredServersKey]: 'true',
            xdebug_debug_ports: [workspaceConfig.v3Port, workspaceConfig.v2Port].map((port) => ({
                [portKey]: port
            }))
        });
    }

    return hasChanges;
};

module.exports = setupPHPDebugGeneral;
