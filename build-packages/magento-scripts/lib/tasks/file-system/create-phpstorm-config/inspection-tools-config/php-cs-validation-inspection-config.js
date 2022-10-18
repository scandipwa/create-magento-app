const {
    classes: { PHP_CS_VALIDATION_INSPECTION },
    options: {
        CODING_STANDARD_OPTION_NAME,
        MAGENTO2_CODING_STANDARD_OPTION_VALUE,
        EXTENSIONS_OPTION_NAME,
        WARNING_HIGHLIGHT_LEVEL_NAME_OPTION_NAME,
        WARNING_HIGHLIGHT_LEVEL_NAME_OPTION_VALUE,
        SHOW_SNIFF_NAMES_OPTION_NAME
    }
} = require('./config')
const { classKey, nameKey, valueKey } = require('../keys')
const setupDefaultProperties = require('./default-properties-config')
const setupMagento2CodingStandardOption = require('./magento-coding-standard-config')

const phpCSConfigDefaultOptions = [
    {
        [nameKey]: CODING_STANDARD_OPTION_NAME,
        [valueKey]: MAGENTO2_CODING_STANDARD_OPTION_VALUE
    },
    {
        [nameKey]: WARNING_HIGHLIGHT_LEVEL_NAME_OPTION_NAME,
        [valueKey]: WARNING_HIGHLIGHT_LEVEL_NAME_OPTION_VALUE
    },
    {
        [nameKey]: SHOW_SNIFF_NAMES_OPTION_NAME,
        [valueKey]: 'true'
    },
    {
        [nameKey]: EXTENSIONS_OPTION_NAME,
        [valueKey]: 'php'
    }
]

const setupPhpCSValidationInspection = async (inspectionToolsData) => {
    let hasChanges = false
    const phpCSConfig = inspectionToolsData.find(
        (inspectionToolData) =>
            inspectionToolData[classKey] === PHP_CS_VALIDATION_INSPECTION
    )

    if (phpCSConfig) {
        const hasChangesInProperties = setupDefaultProperties(phpCSConfig)
        if (hasChangesInProperties) {
            hasChanges = true
        }

        if (phpCSConfig.option) {
            const hasCodingStandardChanges =
                await setupMagento2CodingStandardOption(phpCSConfig)
            if (hasCodingStandardChanges) {
                hasChanges = true
            }

            const warningHighlightLevelNameOption = phpCSConfig.option.find(
                (option) =>
                    option[nameKey] === WARNING_HIGHLIGHT_LEVEL_NAME_OPTION_NAME
            )

            if (!warningHighlightLevelNameOption) {
                hasChanges = true
                phpCSConfig.option.push({
                    [nameKey]: WARNING_HIGHLIGHT_LEVEL_NAME_OPTION_NAME,
                    [valueKey]: WARNING_HIGHLIGHT_LEVEL_NAME_OPTION_VALUE
                })
            }

            const showSniffNamesOption = phpCSConfig.option.find(
                (option) => option[nameKey] === SHOW_SNIFF_NAMES_OPTION_NAME
            )

            if (!showSniffNamesOption) {
                hasChanges = true
                phpCSConfig.option.push({
                    [nameKey]: SHOW_SNIFF_NAMES_OPTION_NAME,
                    [valueKey]: 'true'
                })
            }

            // we want php code sniffer to lint only php files
            // for other files (js, css, scss) we have separate linter setups
            const extensionsOption = phpCSConfig.option.find(
                (option) => option[nameKey] === EXTENSIONS_OPTION_NAME
            )

            if (!extensionsOption) {
                hasChanges = true
                phpCSConfig.option.push({
                    [nameKey]: EXTENSIONS_OPTION_NAME,
                    [valueKey]: 'php'
                })
            }
        } else {
            hasChanges = true
            phpCSConfig.option = phpCSConfigDefaultOptions
        }
    } else {
        hasChanges = true

        const phpCSConfig = {
            [classKey]: PHP_CS_VALIDATION_INSPECTION,
            option: phpCSConfigDefaultOptions
        }

        setupDefaultProperties(phpCSConfig)

        inspectionToolsData.push(phpCSConfig)
    }

    return hasChanges
}

module.exports = setupPhpCSValidationInspection
