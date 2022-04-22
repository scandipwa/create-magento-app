const path = require('path');
const pathExists = require('../../../../util/path-exists');
const { nameKey, toolPathKey } = require('../keys');
const { formatPathForPHPStormConfig } = require('../xml-utils');

const phpMDBinaryPath = path.join(process.cwd(), 'vendor', 'bin', 'phpmd');
const phpMDBinaryFormattedPath = formatPathForPHPStormConfig(phpMDBinaryPath);

/**
 * @param {Array} phpConfigs
 * @returns {Promise<Boolean>}
 */
const setupMessDetector = async (phpConfigs) => {
    let hasChanges = false;
    const messDetectorComponent = phpConfigs.find(
        (phpConfig) => phpConfig[nameKey] === 'MessDetector'
    );

    const isPhpMDBinPathExists = await pathExists(phpMDBinaryPath);

    if (messDetectorComponent && isPhpMDBinPathExists) {
        if (!Array.isArray(messDetectorComponent.phpmd_settings)) {
            hasChanges = true;
            messDetectorComponent.phpmd_settings = [messDetectorComponent.phpmd_settings];
        }

        const messDetectorConfiguration = messDetectorComponent.phpmd_settings.find(
            (phpmdSetting) => phpmdSetting.MessDetectorConfiguration
        );

        if (messDetectorConfiguration && messDetectorConfiguration[toolPathKey] !== phpMDBinaryFormattedPath) {
            hasChanges = true;
            messDetectorConfiguration[toolPathKey] = phpMDBinaryFormattedPath;
        } else if (!messDetectorConfiguration) {
            hasChanges = true;
            messDetectorComponent.phpmd_settings.push({
                MessDetectorConfiguration: {
                    [toolPathKey]: phpMDBinaryFormattedPath
                }
            });
        }
    } else if (isPhpMDBinPathExists) {
        hasChanges = true;
        phpConfigs.push({
            [nameKey]: 'MessDetector',
            phpmd_settings: [
                {
                    MessDetectorConfiguration: {
                        [toolPathKey]: phpMDBinaryFormattedPath
                    }
                }
            ]
        });
    }

    return hasChanges;
};

module.exports = setupMessDetector;
