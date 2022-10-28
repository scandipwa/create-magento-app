const path = require('path')
const { loadXmlFile, buildXmlFile } = require('../../../config/xml-parser')
const pathExists = require('../../../util/path-exists')
const { valueKey, nameKey } = require('./keys')
const { getCSAThemes } = require('../../../util/CSA-theme')
const { formatPathForPHPStormConfig } = require('./xml-utils')

const ESLINT_COMPONENT_NAME = 'EslintConfiguration'

const pathToESLintConfig = path.join(
    process.cwd(),
    '.idea',
    'jsLinters',
    'eslint.xml'
)

const defaultESLintComponentConfiguration = {
    [nameKey]: ESLINT_COMPONENT_NAME,
    option: {
        [nameKey]: 'fix-on-save',
        [valueKey]: 'true'
    }
}

const esLintDefaultConfigurationData = {
    '?xml': {
        '@_version': '1.0',
        '@_encoding': 'UTF-8'
    },
    project: {
        '@_version': '4',
        component: defaultESLintComponentConfiguration
    }
}

const setupESlintConfig = async (esLintConfigurationData) => {
    let hasChanges = false
    const themes = await getCSAThemes()

    if (themes.length > 0) {
        const theme = themes[0]
        if (await pathExists(theme.themePath)) {
            if (esLintConfigurationData['work-dir-pattern'] === undefined) {
                hasChanges = true
                esLintConfigurationData['work-dir-pattern'] = {
                    [valueKey]: formatPathForPHPStormConfig(theme.themePath)
                }
            }
            const packageJsonPath = path.join(
                process.cwd(),
                theme.themePath,
                'package.json'
            )
            if (await pathExists(packageJsonPath)) {
                if (
                    esLintConfigurationData['custom-configuration-file'] ===
                    undefined
                ) {
                    hasChanges = true
                    esLintConfigurationData['custom-configuration-file'] = {
                        '@_used': 'true',
                        '@_path': formatPathForPHPStormConfig(packageJsonPath)
                    }
                }
            }
        }
    }

    return hasChanges
}

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const setupESLintConfigTask = () => ({
    title: 'Set up ESLint configuration',
    task: async (ctx, task) => {
        if (await pathExists(pathToESLintConfig)) {
            let hasChanges = false
            const esLintConfigurationData = await loadXmlFile(
                pathToESLintConfig
            )

            if (!esLintConfigurationData.project) {
                esLintConfigurationData.project = {
                    ...esLintDefaultConfigurationData.project
                }
            }

            if (!esLintConfigurationData['?xml']) {
                esLintConfigurationData['?xml'] = {
                    ...esLintDefaultConfigurationData['?xml']
                }
            }

            if (
                esLintConfigurationData.project.component &&
                !Array.isArray(esLintConfigurationData.project.component)
            ) {
                hasChanges = true
                esLintConfigurationData.project.component = [
                    esLintConfigurationData.project.component
                ]
            }

            const esLintConfigurationComponent =
                esLintConfigurationData.project.component.find(
                    (config) => config[nameKey] === ESLINT_COMPONENT_NAME
                )

            if (!esLintConfigurationComponent) {
                hasChanges = true
                esLintConfigurationData.project.component.push(
                    defaultESLintComponentConfiguration
                )
            }

            const hasThemeEslintChanges = await setupESlintConfig(
                esLintConfigurationComponent
            )
            if (hasThemeEslintChanges) {
                hasChanges = hasThemeEslintChanges
            }

            if (hasChanges) {
                await buildXmlFile(pathToESLintConfig, esLintConfigurationData)
            } else {
                task.skip()
            }

            return
        }

        await setupESlintConfig(esLintDefaultConfigurationData)

        await buildXmlFile(pathToESLintConfig, esLintDefaultConfigurationData)
    }
})

module.exports = setupESLintConfigTask
