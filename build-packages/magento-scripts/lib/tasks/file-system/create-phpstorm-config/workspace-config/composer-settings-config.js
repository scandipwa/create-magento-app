const path = require('path');
const { baseConfig } = require('../../../../config');
const pathExists = require('../../../../util/path-exists');
const { nameKey } = require('../keys');
const { formatPathForPHPStormConfig } = require('../xml-utils');

const COMPOSER_SETTINGS_COMPONENT_NAME = 'ComposerSettings';

const pharPathKey = '@_pharPath';
const doNotAskKey = '@_doNotAsk';
const synchronizationStateKey = '@_synchronizationState';

const composerJsonPath = path.join(process.cwd(), 'composer.json');
const composerJsonFormattedPath = formatPathForPHPStormConfig(composerJsonPath);
const composerPharPath = path.join(baseConfig.cacheDir, 'composer', 'composer.phar');
const composerPharFormattedPath = formatPathForPHPStormConfig(composerPharPath);

const defaultComposerSettingsProperties = {
    [doNotAskKey]: 'true',
    [synchronizationStateKey]: 'SYNCHRONIZE'
};

// TODO Ideally, we want to setup interpreter for compose.phar

// It should look like this:
// <component name="ComposerSettings" synchronizationState="DONT_SYNCHRONIZE">
//     <pharConfigPath>$PROJECT_DIR$/composer.json</pharConfigPath>
//     <execution>
//         <phar
//             pharPath="$PROJECT_DIR$/node_modules/.create-magento-app-cache/composer/composer.phar"
//             interpreterId="f19b09e2-16e7-491f-9056-3299df58e578"
//         />
//     </execution>
// </component>

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
            !('pharConfigPath' in composerSettingsComponent)
            && isComposerJsonExists
        ) {
            hasChanges = true;
            composerSettingsComponent.pharConfigPath = composerJsonFormattedPath;
        }

        const pharConfig = composerSettingsComponent.execution && composerSettingsComponent.execution.phar;

        if (pharConfig && isComposerPharExists && !(pharPathKey in pharConfig)) {
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
            ...defaultComposerSettingsProperties,
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
