const { nameKey, valueKey } = require('../keys')

const FORMAT_ON_SAVE_OPTIONS_COMPONENT_NAME = 'FormatOnSaveOptions'

const MY_FORMAT_ONLY_CHANGED_LINES_OPTION_NAME = 'myFormatOnlyChangedLines'
const MY_RUN_ON_SAVE_OPTION_NAME = 'myRunOnSave'

/**
 * @param {Array} workspaceConfigs
 * @returns {Promise<Boolean>}
 */
const setupFormatOnSave = async (workspaceConfigs) => {
    let hasChanges = false
    const formatOnSaveOptionsComponent = workspaceConfigs.find(
        (workspaceConfig) =>
            workspaceConfig[nameKey] === FORMAT_ON_SAVE_OPTIONS_COMPONENT_NAME
    )

    if (formatOnSaveOptionsComponent) {
        if (
            formatOnSaveOptionsComponent.option &&
            !Array.isArray(formatOnSaveOptionsComponent.option)
        ) {
            hasChanges = true
            formatOnSaveOptionsComponent.option = [
                formatOnSaveOptionsComponent.option
            ]
        } else if (!formatOnSaveOptionsComponent.option) {
            hasChanges = true
            formatOnSaveOptionsComponent.option = []
        }

        const missingOptions = [
            MY_FORMAT_ONLY_CHANGED_LINES_OPTION_NAME,
            MY_RUN_ON_SAVE_OPTION_NAME
        ].filter(
            (optionName) =>
                !formatOnSaveOptionsComponent.option.some(
                    (option) => option[nameKey] === optionName
                )
        )

        if (missingOptions.length > 0) {
            hasChanges = true
            missingOptions.forEach((missingOption) => {
                formatOnSaveOptionsComponent.option.push({
                    [nameKey]: missingOption,
                    [valueKey]: 'true'
                })
            })
        }
    } else {
        hasChanges = true
        workspaceConfigs.push({
            [nameKey]: FORMAT_ON_SAVE_OPTIONS_COMPONENT_NAME,
            option: [
                MY_FORMAT_ONLY_CHANGED_LINES_OPTION_NAME,
                MY_RUN_ON_SAVE_OPTION_NAME
            ].map((option) => ({
                [nameKey]: option,
                [valueKey]: 'true'
            }))
        })
    }

    return hasChanges
}

module.exports = setupFormatOnSave
