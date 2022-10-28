const { nameKey, valueKey } = require('../keys')

const PHP_CS_FIXER_PROJECT_CONFIGURATION_COMPONENT_NAME =
    'PHPCSFixerProjectConfiguration'

const selectedConfigurationIdName = 'selectedConfigurationId'
const value = 'DEFAULT_INTERPRETER'

const defaultOption = {
    [nameKey]: selectedConfigurationIdName,
    [valueKey]: value
}

/**
 * @param {Array} workspaceConfigs
 * @returns {Promise<Boolean>}
 */
const setupPHPCSFixerProjectConfiguration = async (workspaceConfigs) => {
    let hasChanges = false
    const phpCSFixeProjectConfigurationComponent = workspaceConfigs.find(
        (workspaceConfig) =>
            workspaceConfig[nameKey] ===
            PHP_CS_FIXER_PROJECT_CONFIGURATION_COMPONENT_NAME
    )

    if (phpCSFixeProjectConfigurationComponent) {
        if (
            phpCSFixeProjectConfigurationComponent.option &&
            !Array.isArray(phpCSFixeProjectConfigurationComponent.option)
        ) {
            hasChanges = true
            phpCSFixeProjectConfigurationComponent.option = [
                phpCSFixeProjectConfigurationComponent.option
            ]
        } else if (!phpCSFixeProjectConfigurationComponent.option) {
            hasChanges = true
            phpCSFixeProjectConfigurationComponent.option = []
        }

        if (
            phpCSFixeProjectConfigurationComponent.option.length > 0 &&
            !phpCSFixeProjectConfigurationComponent.option.some(
                (option) => option[nameKey] === selectedConfigurationIdName
            )
        ) {
            phpCSFixeProjectConfigurationComponent.option = [defaultOption]
            hasChanges = true
        }
    } else {
        hasChanges = true
        workspaceConfigs.push({
            [nameKey]: PHP_CS_FIXER_PROJECT_CONFIGURATION_COMPONENT_NAME,
            option: [defaultOption]
        })
    }

    return hasChanges
}

module.exports = setupPHPCSFixerProjectConfiguration
