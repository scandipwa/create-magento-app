const { nameKey, valueKey } = require('../keys')

const PSALM_PROJECT_CONFIGURATION_COMPONENT_NAME = 'PsalmProjectConfiguration'

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
const setupPSalmProjectConfiguration = async (workspaceConfigs) => {
    let hasChanges = false
    const psalmProjectConfigurationComponent = workspaceConfigs.find(
        (workspaceConfig) =>
            workspaceConfig[nameKey] ===
            PSALM_PROJECT_CONFIGURATION_COMPONENT_NAME
    )

    if (psalmProjectConfigurationComponent) {
        if (
            psalmProjectConfigurationComponent.option &&
            !Array.isArray(psalmProjectConfigurationComponent.option)
        ) {
            hasChanges = true
            psalmProjectConfigurationComponent.option = [
                psalmProjectConfigurationComponent.option
            ]
        } else if (!psalmProjectConfigurationComponent.option) {
            hasChanges = true
            psalmProjectConfigurationComponent.option = []
        }

        if (
            psalmProjectConfigurationComponent.option.length > 0 &&
            !psalmProjectConfigurationComponent.option.some(
                (option) => option[nameKey] === selectedConfigurationIdName
            )
        ) {
            psalmProjectConfigurationComponent.option = [defaultOption]
            hasChanges = true
        }
    } else {
        hasChanges = true
        workspaceConfigs.push({
            [nameKey]: PSALM_PROJECT_CONFIGURATION_COMPONENT_NAME,
            option: [defaultOption]
        })
    }

    return hasChanges
}

module.exports = setupPSalmProjectConfiguration
