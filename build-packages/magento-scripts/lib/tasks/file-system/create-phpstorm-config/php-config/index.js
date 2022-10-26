const { loadXmlFile, buildXmlFile } = require('../../../../config/xml-parser')
const pathExists = require('../../../../util/path-exists')
const { setupXMLStructure } = require('../setup-xml-structure')
const setupMessDetector = require('./mess-detector-config')
const setupPHPCodeSniffer = require('./php-code-sniffer-config')
const { getPhpConfig } = require('./php-config')
const setupPHPCSFixer = require('./php-cs-fixer-config')
const setupPHPInterpreters = require('./php-interpreters-config')
const setupPHPProjectSharedConfiguration = require('./php-project-shared-configuration-config')

/**
 * @returns {import('listr2').ListrTask<import('../../../../../typings/context').ListrContext>}
 */
const setupPhpConfig = () => ({
    title: 'Set up PHP configuration',
    task: async (ctx, task) => {
        const phpConfig = getPhpConfig(ctx)

        if (await pathExists(phpConfig.path)) {
            const phpConfigContent = setupXMLStructure(
                await loadXmlFile(phpConfig.path)
            )
            const phpConfigs = phpConfigContent.project.component
            const hasChanges = await Promise.all([
                setupMessDetector(phpConfigs),
                setupPHPCodeSniffer(phpConfigs),
                setupPHPCSFixer(phpConfigs),
                setupPHPInterpreters(phpConfigs, ctx),
                setupPHPProjectSharedConfiguration(
                    phpConfigs,
                    phpConfig.phpLanguageLevel
                )
            ])

            if (hasChanges.includes(true)) {
                await buildXmlFile(phpConfig.path, phpConfigContent)
            } else {
                task.skip()
            }

            return
        }

        const phpConfigContent = setupXMLStructure()
        const phpConfigs = phpConfigContent.project.component

        await Promise.all([
            setupMessDetector(phpConfigs),
            setupPHPCodeSniffer(phpConfigs),
            setupPHPCSFixer(phpConfigs),
            setupPHPInterpreters(phpConfigs, ctx),
            setupPHPProjectSharedConfiguration(
                phpConfigs,
                phpConfig.phpLanguageLevel
            )
        ])

        await buildXmlFile(phpConfig.path, phpConfigContent)
    }
})

module.exports = setupPhpConfig
