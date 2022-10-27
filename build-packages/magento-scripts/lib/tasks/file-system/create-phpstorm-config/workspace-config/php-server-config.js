const { nameKey } = require('../keys')

const PHP_SERVERS_COMPONENT_NAME = 'PhpServers'

const hostKey = '@_host'
const usePathMappingsKey = '@_use_path_mappings'
const localRootKey = '@_local-root'
const remoteRootKey = '@_remote-root'

/**
 * @param {Array} workspaceConfigs
 * @param {ReturnType<typeof import('./workspace-config').getWorkspaceConfig>} workspaceConfig
 * @param {import('../../../../../typings/context').ListrContext} ctx
 * @returns {Promise<Boolean>}
 */
const setupPHPServers = async (workspaceConfigs, workspaceConfig, ctx) => {
    let hasChanges = false
    const phpServersComponent = workspaceConfigs.find(
        (workspaceConfig) =>
            workspaceConfig[nameKey] === PHP_SERVERS_COMPONENT_NAME
    )

    const defaultServerConfig = {
        [hostKey]: workspaceConfig.debugServerAddress,
        id: '7e16e907-9ce3-4559-9d26-a30a5650d11f',
        [nameKey]: workspaceConfig.serverName,
        [usePathMappingsKey]: true,
        path_mappings: {
            mapping: {
                [localRootKey]: '$PROJECT_DIR$',
                [remoteRootKey]: ctx.config.baseConfig.containerMagentoDir
            }
        }
    }

    if (phpServersComponent) {
        if (
            phpServersComponent.servers &&
            !Array.isArray(phpServersComponent.servers)
        ) {
            hasChanges = true
            phpServersComponent.servers = [phpServersComponent.servers]
        } else if (!phpServersComponent.servers) {
            hasChanges = true
            phpServersComponent.servers = []
        }

        const serverConfiguration = phpServersComponent.servers.find(
            (server) => server.server[nameKey] === workspaceConfig.serverName
        )

        if (!serverConfiguration || !serverConfiguration.server) {
            hasChanges = true
            phpServersComponent.servers.push({
                server: defaultServerConfig
            })
        } else if (serverConfiguration.server) {
            if (!serverConfiguration.server[usePathMappingsKey]) {
                hasChanges = true
                serverConfiguration.server[usePathMappingsKey] = true
            }
            if (
                !serverConfiguration.server.path_mappings ||
                (serverConfiguration.server.path_mappings.mapping &&
                    serverConfiguration.server.path_mappings.mapping[
                        remoteRootKey
                    ] !==
                        defaultServerConfig.path_mappings.mapping[
                            remoteRootKey
                        ])
            ) {
                hasChanges = true
                serverConfiguration.server.path_mappings =
                    serverConfiguration.server.path_mappings || {}
                serverConfiguration.server.path_mappings.mapping =
                    defaultServerConfig.path_mappings.mapping
            }
        }
    } else {
        hasChanges = true
        workspaceConfigs.push({
            [nameKey]: PHP_SERVERS_COMPONENT_NAME,
            servers: [
                {
                    server: defaultServerConfig
                }
            ]
        })
    }

    return hasChanges
}

module.exports = setupPHPServers
