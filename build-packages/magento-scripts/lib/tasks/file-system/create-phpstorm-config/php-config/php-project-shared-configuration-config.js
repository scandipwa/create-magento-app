const { nameKey, valueKey } = require('../keys')

const PHP_PROJECT_SHARED_CONFIGURATION_COMPONENT_NAME =
    'PhpProjectSharedConfiguration'

const SUGGESTED_CHANGE_DEFAULT_LANGUAGE_LEVEL_OPTION_NAME =
    'suggestChangeDefaultLanguageLevel'

const phpLanguageLevelKey = '@_php_language_level'

/**
 * @param {Array} phpConfigs
 * @param {String} currentPhpLanguageLevel
 * @returns {Promise<Boolean>}
 */
const setupPHPProjectSharedConfiguration = async (
    phpConfigs,
    currentPhpLanguageLevel
) => {
    let hasChanges = false
    const phpProjectSharedConfigurationComponent = phpConfigs.find(
        (phpConfig) =>
            phpConfig[nameKey] ===
            PHP_PROJECT_SHARED_CONFIGURATION_COMPONENT_NAME
    )

    const defaultSuggestChangeDefaultLanguageLevelOption = {
        [nameKey]: SUGGESTED_CHANGE_DEFAULT_LANGUAGE_LEVEL_OPTION_NAME,
        [valueKey]: currentPhpLanguageLevel
    }

    if (phpProjectSharedConfigurationComponent) {
        if (
            phpProjectSharedConfigurationComponent.option &&
            !Array.isArray(phpProjectSharedConfigurationComponent.option)
        ) {
            hasChanges = true
            phpProjectSharedConfigurationComponent.option = [
                phpProjectSharedConfigurationComponent.option
            ]
        } else if (!phpProjectSharedConfigurationComponent.option) {
            hasChanges = true
            phpProjectSharedConfigurationComponent.option = []
        }

        const suggestedChangeDefaultLanguageLevelOption =
            phpProjectSharedConfigurationComponent.option.find(
                (phpProjectSharedConfigOption) =>
                    phpProjectSharedConfigOption[nameKey] ===
                    SUGGESTED_CHANGE_DEFAULT_LANGUAGE_LEVEL_OPTION_NAME
            )

        if (!suggestedChangeDefaultLanguageLevelOption) {
            hasChanges = true
            phpProjectSharedConfigurationComponent.option.push(
                defaultSuggestChangeDefaultLanguageLevelOption
            )
        }
    } else {
        hasChanges = true
        phpConfigs.push({
            [nameKey]: PHP_PROJECT_SHARED_CONFIGURATION_COMPONENT_NAME,
            [phpLanguageLevelKey]: currentPhpLanguageLevel,
            option: [defaultSuggestChangeDefaultLanguageLevelOption]
        })
    }

    return hasChanges
}

module.exports = setupPHPProjectSharedConfiguration
