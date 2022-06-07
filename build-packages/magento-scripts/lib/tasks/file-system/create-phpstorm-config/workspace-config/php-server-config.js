const { nameKey } = require('../keys');

const PHP_SERVERS_COMPONENT_NAME = 'PhpServers';

const hostKey = '@_host';

/**
 * @param {Array} workspaceConfigs
 * @param {ReturnType<typeof import('./workspace-config').getWorkspaceConfig>} workspaceConfig
 * @returns {Promise<Boolean>}
 */
const setupPHPServers = async (workspaceConfigs, workspaceConfig) => {
    let hasChanges = false;
    const phpServersComponent = workspaceConfigs.find(
        (workspaceConfig) => workspaceConfig[nameKey] === PHP_SERVERS_COMPONENT_NAME
    );

    const defaultServerConfig = {
        [hostKey]: workspaceConfig.debugServerAddress,
        id: '7e16e907-9ce3-4559-9d26-a30a5650d11f',
        [nameKey]: workspaceConfig.serverName
    };

    if (phpServersComponent) {
        if (phpServersComponent.servers && !Array.isArray(phpServersComponent.servers)) {
            hasChanges = true;
            phpServersComponent.servers = [phpServersComponent.servers];
        } else if (!phpServersComponent.servers) {
            hasChanges = true;
            phpServersComponent.servers = [];
        }

        const serverConfiguration = phpServersComponent.servers.find((server) => server.server[nameKey] === workspaceConfig.serverName);

        if (!serverConfiguration) {
            hasChanges = true;
            phpServersComponent.servers.push({
                server: defaultServerConfig
            });
        }
    } else {
        hasChanges = true;
        workspaceConfigs.push({
            [nameKey]: PHP_SERVERS_COMPONENT_NAME,
            servers: [
                {
                    server: defaultServerConfig
                }
            ]
        });
    }

    return hasChanges;
};

module.exports = setupPHPServers;
