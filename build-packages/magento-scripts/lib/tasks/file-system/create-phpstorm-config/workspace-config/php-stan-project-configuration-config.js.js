const { nameKey, valueKey } = require('../keys')

const PHP_STAN_PROJECT_CONFIGURATION_COMPONENT_NAME =
    'PhpStanProjectConfiguration'

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
const setupPHPStanProjectConfiguration = async (workspaceConfigs) => {
    let hasChanges = false
    const phpStanProjectConfigurationComponent = workspaceConfigs.find(
        (workspaceConfig) =>
            workspaceConfig[nameKey] ===
            PHP_STAN_PROJECT_CONFIGURATION_COMPONENT_NAME
    )

    if (phpStanProjectConfigurationComponent) {
        if (
            phpStanProjectConfigurationComponent.option &&
            !Array.isArray(phpStanProjectConfigurationComponent.option)
        ) {
            hasChanges = true
            phpStanProjectConfigurationComponent.option = [
                phpStanProjectConfigurationComponent.option
            ]
        } else if (!phpStanProjectConfigurationComponent.option) {
            hasChanges = true
            phpStanProjectConfigurationComponent.option = []
        }

        if (
            phpStanProjectConfigurationComponent.option.length > 0 &&
            !phpStanProjectConfigurationComponent.option.some(
                (option) => option[nameKey] === selectedConfigurationIdName
            )
        ) {
            phpStanProjectConfigurationComponent.option = [defaultOption]
            hasChanges = true
        }
    } else {
        hasChanges = true
        workspaceConfigs.push({
            [nameKey]: PHP_STAN_PROJECT_CONFIGURATION_COMPONENT_NAME,
            option: [defaultOption]
        })
    }

    return hasChanges
}

module.exports = setupPHPStanProjectConfiguration
