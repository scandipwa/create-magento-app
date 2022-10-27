const path = require('path')
const fs = require('fs')
const { loadXmlFile, buildXmlFile } = require('../../../config/xml-parser')
const pathExists = require('../../../util/path-exists')
const { valueKey, nameKey } = require('./keys')
const { setupXMLStructure } = require('./setup-xml-structure')

const STYLELINT_CONFIGURATION_COMPONENT_NAME = 'StylelintConfiguration'

const pathToStylelintConfig = path.join(
    process.cwd(),
    '.idea',
    'stylesheetLinters',
    'stylelint.xml'
)
const pathToStylelintConfigDir = path.parse(pathToStylelintConfig).dir

const DEFAULT_STYLE_PATTERN = '{**/*,*}.{css,scss}'

const defaultESLintComponentConfiguration = {
    [nameKey]: STYLELINT_CONFIGURATION_COMPONENT_NAME,
    'file-patterns': {
        [valueKey]: DEFAULT_STYLE_PATTERN
    }
}

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const setupStylelintConfig = () => ({
    title: 'Set up Stylelint configuration',
    task: async (ctx, task) => {
        if (await pathExists(pathToStylelintConfig)) {
            let hasChanges = false
            const styleLintConfigurationData = setupXMLStructure(
                await loadXmlFile(pathToStylelintConfig)
            )

            if (
                styleLintConfigurationData.project.component &&
                !Array.isArray(styleLintConfigurationData.project.component)
            ) {
                hasChanges = true
                styleLintConfigurationData.project.component = [
                    styleLintConfigurationData.project.component
                ]
            }

            const styleLintConfigurationComponent =
                styleLintConfigurationData.project.component.find(
                    (component) =>
                        component[nameKey] ===
                        STYLELINT_CONFIGURATION_COMPONENT_NAME
                )

            if (!styleLintConfigurationComponent) {
                hasChanges = true
                styleLintConfigurationData.project.component.push(
                    defaultESLintComponentConfiguration
                )
            }

            if (hasChanges) {
                await buildXmlFile(
                    pathToStylelintConfig,
                    styleLintConfigurationData
                )
            } else {
                task.skip()
            }

            return
        }

        if (!(await pathExists(pathToStylelintConfigDir))) {
            await fs.promises.mkdir(pathToStylelintConfigDir, {
                recursive: true
            })
        }

        const styleLintConfigurationData = {
            '?xml': {
                '@_version': '1.0',
                '@_encoding': 'UTF-8'
            },
            project: {
                '@_version': '4',
                component: [defaultESLintComponentConfiguration]
            }
        }

        await buildXmlFile(pathToStylelintConfig, styleLintConfigurationData)
    }
})

module.exports = setupStylelintConfig
