/**
 * @type {{
 *  enabled: 'true' | 'false',
 *  enabled_by_default: 'true' | 'false',
 *  level: 'ERROR' | 'WEAK WARNING'
 * }}
 */
const properties = {
    enabled: 'true',
    enabled_by_default: 'true',
    level: 'ERROR'
}

/**
 * @param {Record<string, unknown>} inspectionTool
 * @param {{
 *  enabled: 'true' | 'false',
 *  enabled_by_default: 'true' | 'false',
 *  level: 'ERROR' | 'WEAK WARNING'
 * }} defaultProperties
 * @returns {Boolean}
 */
const setupDefaultProperties = (
    inspectionTool,
    defaultProperties = properties
) => {
    let hasChanges = false
    if (inspectionTool['@_enabled'] === undefined) {
        hasChanges = true
        inspectionTool['@_enabled'] = defaultProperties.enabled
    }

    if (inspectionTool['@_enabled_by_default'] === undefined) {
        hasChanges = true
        inspectionTool['@_enabled_by_default'] =
            defaultProperties.enabled_by_default
    }

    if (inspectionTool['@_level'] === undefined) {
        hasChanges = true
        inspectionTool['@_level'] = defaultProperties.level
    }

    if (inspectionTool.option && !Array.isArray(inspectionTool.option)) {
        hasChanges = true
        inspectionTool.option = [inspectionTool.option]
    }

    return hasChanges
}

module.exports = setupDefaultProperties
