const { nameKey, valueKey } = require('../keys')

const PHP_CODE_SNIFFER_PROJECT_CONFIGURATION_COMPONENT_NAME =
    'PHPCodeSnifferProjectConfiguration'

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
const setupPHPCodeSnifferProjectConfiguration = async (workspaceConfigs) => {
    let hasChanges = false
    const phpCodeSnifferProjectConfigurationComponent = workspaceConfigs.find(
        (workspaceConfig) =>
            workspaceConfig[nameKey] ===
            PHP_CODE_SNIFFER_PROJECT_CONFIGURATION_COMPONENT_NAME
    )

    if (phpCodeSnifferProjectConfigurationComponent) {
        if (
            phpCodeSnifferProjectConfigurationComponent.option &&
            !Array.isArray(phpCodeSnifferProjectConfigurationComponent.option)
        ) {
            hasChanges = true
            phpCodeSnifferProjectConfigurationComponent.option = [
                phpCodeSnifferProjectConfigurationComponent.option
            ]
        } else if (!phpCodeSnifferProjectConfigurationComponent.option) {
            hasChanges = true
            phpCodeSnifferProjectConfigurationComponent.option = []
        }

        if (
            phpCodeSnifferProjectConfigurationComponent.option.length > 0 &&
            !phpCodeSnifferProjectConfigurationComponent.option.some(
                (option) => option[nameKey] === selectedConfigurationIdName
            )
        ) {
            phpCodeSnifferProjectConfigurationComponent.option = [defaultOption]
            hasChanges = true
        }
    } else {
        hasChanges = true
        workspaceConfigs.push({
            [nameKey]: PHP_CODE_SNIFFER_PROJECT_CONFIGURATION_COMPONENT_NAME,
            option: [defaultOption]
        })
    }

    return hasChanges
}

module.exports = setupPHPCodeSnifferProjectConfiguration
