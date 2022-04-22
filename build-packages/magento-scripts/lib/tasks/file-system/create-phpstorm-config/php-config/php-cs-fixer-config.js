const path = require('path');
const pathExists = require('../../../../util/path-exists');
const { nameKey, toolPathKey, standardsKey } = require('../keys');
const { formatPathForPHPStormConfig } = require('../xml-utils');

const PHP_CS_FIXER_COMPONENT_NAME = 'PhpCSFixer';

const phpCSFixerStandards = 'PSR1;PSR2;Symfony;DoctrineAnnotation;PHP70Migration;PHP71Migration';
const phpCSFixerBinaryPath = path.join(process.cwd(), 'vendor', 'bin', 'php-cs-fixer');
const phpCSFixerBinaryFormattedPath = formatPathForPHPStormConfig(phpCSFixerBinaryPath);

/**
 * @param {Array} phpConfigs
 * @returns {Promise<Boolean>}
 */
const setupPHPCSFixer = async (phpConfigs) => {
    let hasChanges = false;
    const phpCSFixerComponent = phpConfigs.find(
        (phpConfig) => phpConfig[nameKey] === PHP_CS_FIXER_COMPONENT_NAME
    );

    const isPhpCSFixerBinPathExists = await pathExists(phpCSFixerBinaryPath);

    if (phpCSFixerComponent && isPhpCSFixerBinPathExists) {
        if (!Array.isArray(phpCSFixerComponent.phpcsfixer_settings)) {
            hasChanges = true;
            phpCSFixerComponent.phpcsfixer_settings = [phpCSFixerComponent.phpcsfixer_settings];
        }

        const phpCSFixerConfiguration = phpCSFixerComponent.phpcsfixer_settings.find(
            (phpcsfixerSetting) => phpcsfixerSetting.PhpCSFixerConfiguration
        );

        if (phpCSFixerConfiguration) {
            if (phpCSFixerConfiguration[toolPathKey] !== phpCSFixerBinaryFormattedPath) {
                hasChanges = true;
                phpCSFixerConfiguration[toolPathKey] = phpCSFixerBinaryFormattedPath;
            }

            if (phpCSFixerConfiguration[standardsKey] !== phpCSFixerStandards) {
                hasChanges = true;
                phpCSFixerConfiguration[standardsKey] = phpCSFixerStandards;
            }
        } else {
            hasChanges = true;
            phpCSFixerComponent.phpcsfixer_settings.push({
                PhpCSFixerConfiguration: {
                    [toolPathKey]: phpCSFixerBinaryFormattedPath,
                    [standardsKey]: phpCSFixerStandards
                }
            });
        }
    } else if (isPhpCSFixerBinPathExists) {
        hasChanges = true;
        phpConfigs.push({
            [nameKey]: PHP_CS_FIXER_COMPONENT_NAME,
            phpcsfixer_settings: [
                {
                    PhpCSFixerConfiguration: {
                        [toolPathKey]: phpCSFixerBinaryFormattedPath,
                        [standardsKey]: phpCSFixerStandards
                    }
                }
            ]
        });
    }

    return hasChanges;
};

module.exports = setupPHPCSFixer;
