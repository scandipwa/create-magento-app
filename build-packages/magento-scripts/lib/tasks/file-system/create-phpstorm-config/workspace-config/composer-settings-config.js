const path = require('path')
const pathExists = require('../../../../util/path-exists')
const { nameKey } = require('../keys')
const { formatPathForPHPStormConfig } = require('../xml-utils')

const COMPOSER_SETTINGS_COMPONENT_NAME = 'ComposerSettings'

const composerKey = '@_composer'
const doNotAskKey = '@_doNotAsk'
const synchronizationStateKey = '@_synchronizationState'

const composerJsonPath = path.join(process.cwd(), 'composer.json')
const composerJsonFormattedPath = formatPathForPHPStormConfig(composerJsonPath)

const defaultComposerSettingsProperties = {
    [doNotAskKey]: 'true',
    [synchronizationStateKey]: 'SYNCHRONIZE'
}

/**
 * @param {Array<Record<string, any>>} workspaceConfigs
 * @param {import('../../../../../typings/context').ListrContext} ctx
 * @returns {Promise<Boolean>}
 */
const setupComposerSettings = async (workspaceConfigs, ctx) => {
    let hasChanges = false
    const composerSettingsComponent = workspaceConfigs.find(
        (workspaceConfig) =>
            workspaceConfig[nameKey] === COMPOSER_SETTINGS_COMPONENT_NAME
    )

    const isComposerJsonExists = await pathExists(composerJsonPath)
    const { php } = ctx.config.docker.getContainers(ctx.ports)
    const defaultInterpreterConfig = {
        [nameKey]: php.image,
        [composerKey]: 'composer'
    }

    if (composerSettingsComponent) {
        if (
            composerSettingsComponent.pharConfigPath === undefined &&
            isComposerJsonExists
        ) {
            hasChanges = true
            composerSettingsComponent.pharConfigPath = composerJsonFormattedPath
        }

        const interpreterConfig =
            composerSettingsComponent.execution &&
            composerSettingsComponent.execution.interpreter

        if (!interpreterConfig) {
            hasChanges = true
            composerSettingsComponent.execution =
                composerSettingsComponent.execution || {}
            composerSettingsComponent.execution.interpreter =
                defaultInterpreterConfig
        } else if (
            interpreterConfig[nameKey] !== defaultInterpreterConfig[nameKey]
        ) {
            hasChanges = true
            composerSettingsComponent.execution.interpreter[nameKey] =
                defaultInterpreterConfig[nameKey]
        }
    } else {
        hasChanges = true
        workspaceConfigs.push({
            [nameKey]: COMPOSER_SETTINGS_COMPONENT_NAME,
            ...defaultComposerSettingsProperties,
            pharConfigPath: composerJsonFormattedPath,
            execution: {
                interpreter: defaultInterpreterConfig
            }
        })
    }

    return hasChanges
}

module.exports = setupComposerSettings
