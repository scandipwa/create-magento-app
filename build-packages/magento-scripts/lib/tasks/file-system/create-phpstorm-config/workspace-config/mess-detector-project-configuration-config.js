const { nameKey, valueKey } = require('../keys')

const MESS_DETECTOR_PROJECT_CONFIGURATION_COMPONENT_NAME =
    'MessDetectorProjectConfiguration'

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
const setupMessDetectorProjectConfiguration = async (workspaceConfigs) => {
    let hasChanges = false
    const messDetectorProjectConfigurationComponent = workspaceConfigs.find(
        (workspaceConfig) =>
            workspaceConfig[nameKey] ===
            MESS_DETECTOR_PROJECT_CONFIGURATION_COMPONENT_NAME
    )

    if (messDetectorProjectConfigurationComponent) {
        if (
            messDetectorProjectConfigurationComponent.option &&
            !Array.isArray(messDetectorProjectConfigurationComponent.option)
        ) {
            hasChanges = true
            messDetectorProjectConfigurationComponent.option = [
                messDetectorProjectConfigurationComponent.option
            ]
        } else if (!messDetectorProjectConfigurationComponent.option) {
            hasChanges = true
            messDetectorProjectConfigurationComponent.option = []
        }

        if (
            messDetectorProjectConfigurationComponent.option.length > 0 &&
            !messDetectorProjectConfigurationComponent.option.some(
                (option) => option[nameKey] === selectedConfigurationIdName
            )
        ) {
            messDetectorProjectConfigurationComponent.option = [defaultOption]
            hasChanges = true
        }
    } else {
        hasChanges = true
        workspaceConfigs.push({
            [nameKey]: MESS_DETECTOR_PROJECT_CONFIGURATION_COMPONENT_NAME,
            option: [defaultOption]
        })
    }

    return hasChanges
}

module.exports = setupMessDetectorProjectConfiguration
