const path = require('path');
const { baseConfig } = require('../../../../config');
const pathExists = require('../../../../util/path-exists');
const { nameKey } = require('../keys');
const { formatPathForPHPStormConfig } = require('../xml-utils');

const COMPOSER_SETTINGS_COMPONENT_NAME = 'PhpDebugGeneral';

const pharPathKey = '@_pharPath';

const composerJsonPath = path.join(process.cwd(), 'composer.json');
const composerJsonFormattedPath = formatPathForPHPStormConfig(composerJsonPath);
const composerPharPath = path.join(baseConfig.cacheDir, 'composer', 'composer.phar');
const composerPharFormattedPath = formatPathForPHPStormConfig(composerPharPath);

/**
 * @param {Array} workspaceConfigs
 * @returns {Promise<Boolean>}
 */
const setupComposerSettings = async (workspaceConfigs) => {
    let hasChanges = false;
    const composerSettingsComponent = workspaceConfigs.find(
        (workspaceConfig) => workspaceConfig[nameKey] === COMPOSER_SETTINGS_COMPONENT_NAME
    );

    const isComposerJsonExists = await pathExists(composerJsonPath);
    const isComposerPharExists = await pathExists(composerPharPath);

    if (composerSettingsComponent) {
        if (
            'pharConfigPath' in composerSettingsComponent
            && isComposerJsonExists
            && composerSettingsComponent.pharConfigPath !== composerJsonFormattedPath
        ) {
            hasChanges = true;
            composerSettingsComponent.pharConfigPath = composerJsonFormattedPath;
        }

        const pharConfig = composerSettingsComponent.execution && composerSettingsComponent.execution.phar;

        if (pharConfig && isComposerPharExists && pharConfig[pharPathKey] !== composerPharFormattedPath) {
            hasChanges = true;
            pharConfig[pharPathKey] = composerPharFormattedPath;
        } else if (!pharConfig && isComposerPharExists) {
            hasChanges = true;
            composerSettingsComponent.execution = composerSettingsComponent.execution || {};
            composerSettingsComponent.execution.phar = {
                [pharPathKey]: composerPharFormattedPath
            };
        }
    } else {
        hasChanges = true;
        workspaceConfigs.push({
            [nameKey]: COMPOSER_SETTINGS_COMPONENT_NAME,
            pharConfigPath: composerJsonFormattedPath,
            execution: {
                phar: {
                    [pharPathKey]: composerPharFormattedPath
                }
            }
        });
    }

    return hasChanges;
};

module.exports = setupComposerSettings;
