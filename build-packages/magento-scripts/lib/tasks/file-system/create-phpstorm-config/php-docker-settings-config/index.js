const { loadXmlFile, buildXmlFile } = require('../../../../config/xml-parser')
const pathExists = require('../../../../util/path-exists')
const { setupXMLStructure } = require('../setup-xml-structure')
const { getPhpDockerSettingsConfig } = require('./php-docker-settings-config')
const setupPHPDockerContainerSettingsConfig = require('./setup-php-docker-container-settings-config')

/**
 * @returns {import('listr2').ListrTask<import('../../../../../typings/context').ListrContext>}
 */
const setupPhpDockerSettingsConfig = () => ({
    title: 'Set up PHP Docker Settings configuration',
    task: async (ctx, task) => {
        const phpDockerSettingsConfig = getPhpDockerSettingsConfig()

        if (await pathExists(phpDockerSettingsConfig.path)) {
            const phpDockerSettingsConfigContent = setupXMLStructure(
                await loadXmlFile(phpDockerSettingsConfig.path)
            )
            const phpDockerSettingsConfigs =
                phpDockerSettingsConfigContent.project.component
            const hasChanges = await Promise.all([
                setupPHPDockerContainerSettingsConfig(
                    phpDockerSettingsConfigs,
                    ctx
                )
            ])

            if (hasChanges.includes(true)) {
                await buildXmlFile(
                    phpDockerSettingsConfig.path,
                    phpDockerSettingsConfigContent
                )
            } else {
                task.skip()
            }

            return
        }

        const phpDockerSettingsConfigContent = setupXMLStructure({})
        const phpDockerSettingsConfigs =
            phpDockerSettingsConfigContent.project.component

        await Promise.all([
            setupPHPDockerContainerSettingsConfig(phpDockerSettingsConfigs, ctx)
        ])

        await buildXmlFile(
            phpDockerSettingsConfig.path,
            phpDockerSettingsConfigContent
        )
    }
})

module.exports = setupPhpDockerSettingsConfig
