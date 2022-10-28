const { nameKey } = require('../keys')

const RUN_MANAGER_COMPONENT_NAME = 'RunManager'

const PHP_REMOTE_DEBUG_RUN_CONFIGURATION_TYPE =
    'PhpRemoteDebugRunConfigurationType'

const serverNameKey = '@_server_name'
const sessionIdKey = '@_session_id'

/**
 * @param {Array} workspaceConfigs
 * @param {ReturnType<typeof import('./workspace-config').getWorkspaceConfig>} workspaceConfig
 * @returns {Promise<Boolean>}
 */
const setupRunManager = async (workspaceConfigs, workspaceConfig) => {
    let hasChanges = false
    const runManagerComponent = workspaceConfigs.find(
        (workspaceConfig) =>
            workspaceConfig[nameKey] === RUN_MANAGER_COMPONENT_NAME
    )

    const defaultRunManagerConfiguration = {
        [nameKey]: workspaceConfig.runManagerName,
        '@_type': PHP_REMOTE_DEBUG_RUN_CONFIGURATION_TYPE,
        '@_factoryName': 'PHP Remote Debug',
        '@_filter_connections': 'FILTER',
        [serverNameKey]: workspaceConfig.serverName,
        [sessionIdKey]: workspaceConfig.sessionId,
        method: {
            '@_v': '2'
        }
    }

    if (runManagerComponent) {
        if (
            runManagerComponent.configuration &&
            !Array.isArray(runManagerComponent.configuration)
        ) {
            hasChanges = true
            runManagerComponent.configuration = [
                runManagerComponent.configuration
            ]
        } else if (!runManagerComponent.configuration) {
            hasChanges = true
            runManagerComponent.configuration = []
        }

        const phpRemoteDebugRunConfiguration =
            runManagerComponent.configuration.find(
                (configuration) =>
                    configuration['@_type'] ===
                        PHP_REMOTE_DEBUG_RUN_CONFIGURATION_TYPE &&
                    configuration[nameKey] === workspaceConfig.runManagerName
            )

        if (!phpRemoteDebugRunConfiguration) {
            hasChanges = true
            runManagerComponent.configuration.push(
                defaultRunManagerConfiguration
            )
        }
    } else {
        hasChanges = true
        workspaceConfigs.push({
            [nameKey]: RUN_MANAGER_COMPONENT_NAME,
            configuration: [defaultRunManagerConfiguration]
        })
    }

    return hasChanges
}

module.exports = setupRunManager
