const { nameKey } = require('../keys');

const PHP_SERVERS_COMPONENT_NAME = 'PhpDebugGeneral';

const hostKey = '@_host';

/**
 * @param {Array} workspaceConfigs
 * @param {import('../../../../../typings/phpstorm').PHPStormConfig} phpStormConfiguration
 * @returns {Promise<Boolean>}
 */
const setupPHPServers = async (workspaceConfigs, phpStormConfiguration) => {
    const { xdebug } = phpStormConfiguration;
    let hasChanges = false;
    const phpServersComponent = workspaceConfigs.find(
        (workspaceConfig) => workspaceConfig[nameKey] === PHP_SERVERS_COMPONENT_NAME
    );

    const defaultServerConfig = {
        [hostKey]: xdebug.debugServerAddress,
        id: '7e16e907-9ce3-4559-9d26-a30a5650d11f',
        [nameKey]: xdebug.serverName
    };

    if (phpServersComponent) {
        if (phpServersComponent.servers && !Array.isArray(phpServersComponent.servers)) {
            hasChanges = true;
            phpServersComponent.servers = [phpServersComponent.servers];
        } else if (!phpServersComponent.servers) {
            hasChanges = true;
            phpServersComponent.servers = [];
        }

        const serverConfiguration = phpServersComponent.servers.find((server) => server.server[nameKey] === xdebug.serverName);

        if (serverConfiguration && serverConfiguration.server[hostKey] !== xdebug.debugServerAddress) {
            hasChanges = true;
            serverConfiguration.server[hostKey] = xdebug.debugServerAddress;
        } else if (!serverConfiguration) {
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
