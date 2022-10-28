const { phpMDRuleSetFormattedPath } = require('./paths')
const {
    classes: { MESS_DETECTOR_VALIDATION_INSPECTION },
    options: {
        CODESIZE_OPTION_NAME,
        CONTROVERSIAL_OPTION_NAME,
        DESIGN_OPTION_NAME,
        UNUSED_CODE_OPTION_NAME,
        NAMING_OPTION_NAME,
        CUSTOM_RULESETS_OPTION_NAME,
        PHP_MD_RULESET_OPTION_VALUE
    }
} = require('./config')
const { classKey, nameKey, valueKey } = require('../keys')
const setupDefaultProperties = require('./default-properties-config')

const messDetectorBooleanOptionNames = [
    CODESIZE_OPTION_NAME,
    CONTROVERSIAL_OPTION_NAME,
    DESIGN_OPTION_NAME,
    UNUSED_CODE_OPTION_NAME,
    NAMING_OPTION_NAME
]

const messDetectorDefaultRuleSetsListContent = {
    RulesetDescriptor: {
        option: [
            {
                [nameKey]: 'name',
                [valueKey]: PHP_MD_RULESET_OPTION_VALUE
            },
            {
                [nameKey]: 'path',
                [valueKey]: phpMDRuleSetFormattedPath
            }
        ]
    }
}

const messDetectorDefaultOptions = [
    ...messDetectorBooleanOptionNames.map((optionName) => ({
        [nameKey]: optionName,
        [valueKey]: 'true'
    })),
    {
        [nameKey]: CUSTOM_RULESETS_OPTION_NAME,
        list: messDetectorDefaultRuleSetsListContent
    }
]

/**
 * @param {Array} inspectionToolsData
 * @returns {Promise<Boolean>}
 */
const setupMessDetectorValidationInspection = async (inspectionToolsData) => {
    let hasChanges = false
    const messDetectorConfig = inspectionToolsData.find(
        (inspectionToolData) =>
            inspectionToolData[classKey] === MESS_DETECTOR_VALIDATION_INSPECTION
    )
    if (messDetectorConfig) {
        const hasChangesInProperties = setupDefaultProperties(
            messDetectorConfig,
            {
                enabled: 'true',
                enabled_by_default: 'true',
                level: 'WEAK WARNING'
            }
        )

        if (hasChangesInProperties) {
            hasChanges = true
        }

        if (messDetectorConfig.option) {
            messDetectorBooleanOptionNames.forEach((optionName) => {
                const booleanOption = messDetectorConfig.option.find(
                    (o) => o[nameKey] === optionName
                )

                if (!booleanOption) {
                    hasChanges = true
                    messDetectorConfig.option.push({
                        [nameKey]: optionName,
                        [valueKey]: 'true'
                    })
                }
            })

            const customRulesetsOption = messDetectorConfig.option.find(
                (o) => o[nameKey] === CUSTOM_RULESETS_OPTION_NAME
            )

            if (customRulesetsOption) {
                if (!customRulesetsOption.list) {
                    hasChanges = true
                    customRulesetsOption.list = []
                }

                if (
                    customRulesetsOption.list &&
                    !Array.isArray(customRulesetsOption.list)
                ) {
                    hasChanges = true
                    customRulesetsOption.list = [customRulesetsOption.list]
                }

                const correctRulesetsExists = customRulesetsOption.list.some(
                    (r) =>
                        r.RulesetDescriptor.option.some(
                            (o) =>
                                o[nameKey] === 'path' &&
                                o[valueKey] === phpMDRuleSetFormattedPath
                        )
                )

                if (!correctRulesetsExists) {
                    hasChanges = true
                    customRulesetsOption.list.push(
                        messDetectorDefaultRuleSetsListContent
                    )
                }
            } else {
                hasChanges = true
                messDetectorConfig.option.push({
                    [nameKey]: CUSTOM_RULESETS_OPTION_NAME,
                    list: messDetectorDefaultRuleSetsListContent
                })
            }
        } else {
            hasChanges = true
            messDetectorConfig.option = messDetectorDefaultOptions
        }
    } else {
        hasChanges = true
        inspectionToolsData.push({
            [classKey]: MESS_DETECTOR_VALIDATION_INSPECTION,
            '@_enabled': 'true',
            '@_level': 'WEAK WARNING',
            '@_enabled_by_default': 'true',
            option: messDetectorDefaultOptions
        })
    }

    return hasChanges
}

module.exports = setupMessDetectorValidationInspection
