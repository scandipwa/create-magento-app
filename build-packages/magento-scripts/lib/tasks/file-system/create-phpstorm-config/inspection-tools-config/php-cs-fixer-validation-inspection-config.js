const {
    classes: { PHP_CS_FIXER_VALIDATION_INSPECTION }
} = require('./config')
const { classKey } = require('../keys')
const setupCodingStandardOption = require('./coding-standard-config')
const setupCustomRuleSetPathOption = require('./custom-ruleset-path-config')
const setupDefaultProperties = require('./default-properties-config')

/**
 * @param {Array} inspectionToolsData
 * @returns {Promise<Boolean>}
 */
const setupPhpCSFixerValidationInspection = async (inspectionToolsData) => {
    let hasChanges = false
    const phpCSFixerConfig = inspectionToolsData.find(
        (inspectionToolData) =>
            inspectionToolData[classKey] === PHP_CS_FIXER_VALIDATION_INSPECTION
    )

    if (phpCSFixerConfig) {
        const hasChangesInProperties = setupDefaultProperties(phpCSFixerConfig)
        if (hasChangesInProperties) {
            hasChanges = true
        }

        if (phpCSFixerConfig.option) {
            const hasCodingStandardChanges = await setupCodingStandardOption(
                phpCSFixerConfig
            )
            if (hasCodingStandardChanges) {
                hasChanges = true
            }

            const hasCustomRuleSetChanges = await setupCustomRuleSetPathOption(
                phpCSFixerConfig
            )
            if (hasCustomRuleSetChanges) {
                hasChanges = true
            }
        } else {
            hasChanges = true
            phpCSFixerConfig.option = []
            await setupCodingStandardOption(phpCSFixerConfig)
            await setupCustomRuleSetPathOption(phpCSFixerConfig)
        }
    } else {
        hasChanges = true
        const phpCSFixerConfig = {
            [classKey]: PHP_CS_FIXER_VALIDATION_INSPECTION,
            option: []
        }

        setupDefaultProperties(phpCSFixerConfig)
        await setupCodingStandardOption(phpCSFixerConfig)
        await setupCustomRuleSetPathOption(phpCSFixerConfig)

        inspectionToolsData.push(phpCSFixerConfig)
    }

    return hasChanges
}

module.exports = setupPhpCSFixerValidationInspection
