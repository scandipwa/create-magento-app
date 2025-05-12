const { nameKey } = require('../keys')

const PHP_WORKSPACE_PROJECT_CONFIGURATION_COMPONENT_NAME =
    'PhpWorkspaceProjectConfiguration'

const interpreterNameKey = '@_interpreter_name'

/**
 * @param {Array<Record<string, any>>} workspaceConfigs
 * @param {import('../../../../../typings/context').ListrContext} ctx
 * @returns {Promise<Boolean>}
 */
const setupPHPWorkspaceProjectConfiguration = async (workspaceConfigs, ctx) => {
    let hasChanges = false
    const phpWorkspaceProjectConfigurationComponent = workspaceConfigs.find(
        (workspaceConfig) =>
            workspaceConfig[nameKey] ===
            PHP_WORKSPACE_PROJECT_CONFIGURATION_COMPONENT_NAME
    )
    const {
        php: { image: currentInterpreterImage }
    } = ctx.config.docker.getContainers(ctx.ports)

    if (phpWorkspaceProjectConfigurationComponent) {
        if (
            !phpWorkspaceProjectConfigurationComponent[interpreterNameKey] ||
            phpWorkspaceProjectConfigurationComponent[interpreterNameKey] !==
                currentInterpreterImage
        ) {
            hasChanges = true
            phpWorkspaceProjectConfigurationComponent[interpreterNameKey] =
                currentInterpreterImage
        }
    } else {
        hasChanges = true
        workspaceConfigs.push({
            [nameKey]: PHP_WORKSPACE_PROJECT_CONFIGURATION_COMPONENT_NAME,
            [interpreterNameKey]: currentInterpreterImage,
            include_path: []
        })
    }

    return hasChanges
}

module.exports = setupPHPWorkspaceProjectConfiguration
