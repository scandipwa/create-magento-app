// xml property key names
const classKey = '@_class'
const nameKey = '@_name'
const valueKey = '@_value'
const toolPathKey = '@_tool_path'
const standardsKey = '@_standards'
const urlKey = '@_url'
const typeKey = '@_type'
const versionKey = '@_version'

/**
 * Makes a xml property key
 * @param {string} key
 * @returns {string}
 */
const propertyKey = (key) => `@_${key}`

module.exports = {
    classKey,
    nameKey,
    valueKey,
    toolPathKey,
    standardsKey,
    urlKey,
    typeKey,
    versionKey,
    propertyKey
}
