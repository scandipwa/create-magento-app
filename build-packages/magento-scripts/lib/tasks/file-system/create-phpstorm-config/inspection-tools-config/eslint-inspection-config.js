const {
    classes: { ESLINT_INSPECTION }
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
const setupESLintInspection = async (inspectionToolsData) => {
    let hasChanges = false
    const eslintConfig = inspectionToolsData.find(
        (inspectionToolData) =>
            inspectionToolData[classKey] === ESLINT_INSPECTION
    )

    if (eslintConfig) {
        hasChanges = setupDefaultProperties(eslintConfig)
    } else {
        hasChanges = true
        inspectionToolsData.push({
            [classKey]: ESLINT_INSPECTION,
            '@_enabled': 'true',
            '@_level': 'ERROR',
            '@_enabled_by_default': 'true'
        })
    }

    return hasChanges
}

module.exports = setupESLintInspection
