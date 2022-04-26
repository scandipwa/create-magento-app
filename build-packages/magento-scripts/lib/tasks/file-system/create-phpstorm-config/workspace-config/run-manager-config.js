const { nameKey } = require('../keys');

const RUN_MANAGER_COMPONENT_NAME = 'PhpDebugGeneral';

const PHP_REMOTE_DEBUG_RUN_CONFIGURATION_TYPE = 'PhpRemoteDebugRunConfigurationType';

const serverNameKey = '@_server_name';
const sessionIdKey = '@_session_id';

/**
 * @param {Array} workspaceConfigs
 * @param {import('../../../../../typings/phpstorm').PHPStormConfig} phpStormConfiguration
 * @returns {Promise<Boolean>}
 */
const setupRunManager = async (workspaceConfigs, phpStormConfiguration) => {
    const { xdebug } = phpStormConfiguration;
    let hasChanges = false;
    const runManagerComponent = workspaceConfigs.find(
        (workspaceConfig) => workspaceConfig[nameKey] === RUN_MANAGER_COMPONENT_NAME
    );

    const defaultRunManagerConfiguration = {
        [nameKey]: xdebug.runManagerName,
        '@_type': PHP_REMOTE_DEBUG_RUN_CONFIGURATION_TYPE,
        '@_factoryName': 'PHP Remote Debug',
        '@_filter_connections': 'FILTER',
        [serverNameKey]: xdebug.serverName,
        [sessionIdKey]: xdebug.sessionId,
        method: {
            '@_v': '2'
        }
    };

    if (runManagerComponent) {
        if (runManagerComponent.configuration && !Array.isArray(runManagerComponent.configuration)) {
            hasChanges = true;
            runManagerComponent.configuration = [runManagerComponent.configuration];
        } else if (!runManagerComponent.configuration) {
            hasChanges = true;
            runManagerComponent.configuration = [];
        }

        const phpRemoteDebugRunConfiguration = runManagerComponent.configuration.find(
            (configuration) => configuration['@_type'] === PHP_REMOTE_DEBUG_RUN_CONFIGURATION_TYPE && configuration[nameKey] === xdebug.runManagerName
        );

        if (phpRemoteDebugRunConfiguration) {
            if (phpRemoteDebugRunConfiguration[serverNameKey] !== xdebug.serverName) {
                hasChanges = true;
                phpRemoteDebugRunConfiguration[serverNameKey] = xdebug.serverName;
            }

            if (phpRemoteDebugRunConfiguration[sessionIdKey] !== xdebug.sessionId) {
                hasChanges = true;
                phpRemoteDebugRunConfiguration[sessionIdKey] = xdebug.sessionId;
            }
        } else {
            hasChanges = true;
            runManagerComponent.configuration.push(defaultRunManagerConfiguration);
        }
    } else {
        hasChanges = true;
        workspaceConfigs.push({
            [nameKey]: RUN_MANAGER_COMPONENT_NAME,
            configuration: [
                defaultRunManagerConfiguration
            ]
        });
    }

    return hasChanges;
};

module.exports = setupRunManager;
