const { loadXmlFile, buildXmlFile } = require('../../../../config/xml-parser')
const pathExists = require('../../../../util/path-exists')
const { setupXMLStructure } = require('../setup-xml-structure')
const setupComposerSettings = require('./composer-settings-config')
const setupFormatOnSave = require('./format-setting-config')
const setupMessDetectorProjectConfiguration = require('./mess-detector-project-configuration-config')
const setupPHPCodeSnifferProjectConfiguration = require('./php-code-sniffer-project-configuration-config')
const setupPHPCSFixerProjectConfiguration = require('./php-cs-fixer-project-configuration-config')
const setupPHPDebugGeneral = require('./php-debug-general-config')
const setupPHPServers = require('./php-server-config')
const setupPHPStanProjectConfiguration = require('./php-stan-project-configuration-config.js')
const setupPHPWorkspaceProjectConfiguration = require('./php-workspace-project-configuration-config')
const setupPropertiesComponent = require('./properties-component-config')
const setupPSalmProjectConfiguration = require('./psalm-project-configuration-config.js')
const setupRunManager = require('./run-manager-config')
const { getWorkspaceConfig } = require('./workspace-config')

/**
 * @returns {import('listr2').ListrTask<import('../../../../../typings/context').ListrContext>}
 */
const setupWorkspaceConfig = () => ({
    title: 'Set up Workspace configuration',
    task: async (ctx, task) => {
        const workspaceConfig = getWorkspaceConfig(
            ctx.config.overridenConfiguration
        )
        if (await pathExists(workspaceConfig.path)) {
            const workspaceConfiguration = setupXMLStructure(
                await loadXmlFile(workspaceConfig.path)
            )
            const workspaceConfigs = workspaceConfiguration.project.component
            const hasChanges = await Promise.all([
                setupMessDetectorProjectConfiguration(workspaceConfigs),
                setupPHPCSFixerProjectConfiguration(workspaceConfigs),
                setupPHPCodeSnifferProjectConfiguration(workspaceConfigs),
                setupPHPStanProjectConfiguration(workspaceConfigs),
                setupPSalmProjectConfiguration(workspaceConfigs),
                setupPHPWorkspaceProjectConfiguration(workspaceConfigs, ctx),
                setupPHPDebugGeneral(workspaceConfigs, ctx),
                setupPHPServers(workspaceConfigs, workspaceConfig, ctx),
                setupComposerSettings(workspaceConfigs, ctx),
                setupRunManager(workspaceConfigs, workspaceConfig),
                setupPropertiesComponent(workspaceConfigs)
            ])

            if (hasChanges.includes(true)) {
                await buildXmlFile(workspaceConfig.path, workspaceConfiguration)
            } else {
                task.skip()
            }

            return
        }

        const workspaceConfiguration = setupXMLStructure()
        const workspaceConfigs = workspaceConfiguration.project.component

        await Promise.all([
            setupMessDetectorProjectConfiguration(workspaceConfigs),
            setupPHPCSFixerProjectConfiguration(workspaceConfigs),
            setupPHPCodeSnifferProjectConfiguration(workspaceConfigs),
            setupPHPStanProjectConfiguration(workspaceConfigs),
            setupPSalmProjectConfiguration(workspaceConfigs),
            setupPHPDebugGeneral(workspaceConfigs, ctx),
            setupPHPServers(workspaceConfigs, workspaceConfig, ctx),
            setupPHPWorkspaceProjectConfiguration(workspaceConfigs, ctx),
            setupRunManager(workspaceConfigs, workspaceConfig),
            setupPropertiesComponent(workspaceConfigs),
            setupComposerSettings(workspaceConfigs, ctx),
            setupFormatOnSave(workspaceConfigs)
        ])

        await buildXmlFile(workspaceConfig.path, workspaceConfiguration)
    }
})

module.exports = setupWorkspaceConfig
