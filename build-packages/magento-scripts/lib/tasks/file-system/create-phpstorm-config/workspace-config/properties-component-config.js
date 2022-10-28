const path = require('path')
// const { baseConfig } = require('../../../../config');
const { getCSAThemes } = require('../../../../util/CSA-theme')
const pathExists = require('../../../../util/path-exists')
const { nameKey } = require('../keys')
// const { formatPathForPHPStormConfig } = require('../xml-utils');

const PROPERTIES_COMPONENT_NAME = 'PropertiesComponent'

const defaultProperties = {
    keyToString: {
        'RunOnceActivity.OpenProjectViewOnStart': 'true',
        'RunOnceActivity.ShowReadmeOnStart': 'true'
    }
}

/**
 * @param {Array} workspaceConfigs
 * @returns {Promise<Boolean>}
 */
const setupPropertiesComponent = async (workspaceConfigs) => {
    let hasChanges = false
    const propertiesComponent = workspaceConfigs.find(
        (workspaceConfig) =>
            workspaceConfig[nameKey] === PROPERTIES_COMPONENT_NAME
    )

    if (!propertiesComponent) {
        hasChanges = true
        const themes = await getCSAThemes()
        if (themes.length > 0) {
            const theme = themes[0]
            const themeESLintPath = path.join(
                process.cwd(),
                theme.themePath,
                'node_modules',
                'eslint'
            )
            if (await pathExists(themeESLintPath)) {
                defaultProperties.keyToString[
                    'node.js.selected.package.eslint'
                ] = themeESLintPath
                defaultProperties.keyToString[
                    'js.linters.configure.manually.selectedeslint'
                ] = 'true'
                defaultProperties.keyToString[
                    'node.js.detected.package.eslint'
                ] = 'true'
                defaultProperties.keyToString[
                    'settings.editor.selected.configurable'
                ] = 'settings.javascript.linters.eslint'
            }
        }
        workspaceConfigs.push({
            [nameKey]: PROPERTIES_COMPONENT_NAME,
            _cdata: JSON.stringify(defaultProperties)
        })
    }

    return hasChanges
}

module.exports = setupPropertiesComponent
