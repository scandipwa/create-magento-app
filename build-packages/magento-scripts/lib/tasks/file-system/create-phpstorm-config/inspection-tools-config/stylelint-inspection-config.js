const {
    classes: { STYLELINT_INSPECTION }
} = require('./config')
const { classKey } = require('../keys')
const setupDefaultProperties = require('./default-properties-config')

/**
 * Set up Styelint configuration
 *
 * *function is async so it will be properly handled in Promise.all*
 * @param {Array} inspectionToolsData
 * @returns {Promise<Boolean>}
 */
const setupStyleLintInspection = async (inspectionToolsData) => {
    let hasChanges = false
    const stylelintConfig = inspectionToolsData.find(
        (inspectionToolData) =>
            inspectionToolData[classKey] === STYLELINT_INSPECTION
    )

    if (stylelintConfig) {
        hasChanges = setupDefaultProperties(stylelintConfig)
    } else {
        hasChanges = true
        inspectionToolsData.push({
            [classKey]: STYLELINT_INSPECTION,
            '@_enabled': 'true',
            '@_level': 'ERROR',
            '@_enabled_by_default': 'true'
        })
    }

    return hasChanges
}

module.exports = setupStyleLintInspection
