const pathExists = require('../../../../util/path-exists');
const {
    phpCompatibilityRuleSetPath,
    phpCompatibilityFormattedPath,
    phpCSConfigFormattedPath
} = require('./paths');
const {
    classes: {
        PHP_CS_VALIDATION_INSPECTION
    },
    options: {
        CODING_STANDARD_OPTION_NAME,
        CUSTOM_CODING_STANDARD_OPTION_VALUE,
        CUSTOM_RULE_SET_PATH_OPTION_NAME,
        EXTENSIONS_OPTION_NAME,
        WARNING_HIGHLIGHT_LEVEL_NAME_OPTION_NAME,
        WARNING_HIGHLIGHT_LEVEL_NAME_OPTION_VALUE,
        SHOW_SNIFF_NAMES_OPTION_NAME,
        USE_INSTALLED_PATHS_OPTION_NAME,
        INSTALLED_PATHS_OPTION_NAME
    }
} = require('./config');
const {
    classKey,
    nameKey,
    valueKey
} = require('../keys');
const setupCodingStandardOption = require('./coding-standard-config');
const setupCustomRuleSetPathOption = require('./custom-ruleset-path-config');
const setupDefaultProperties = require('./default-properties-config');

const phpCSConfigDefaultOptions = [
    {
        [nameKey]: CODING_STANDARD_OPTION_NAME,
        [valueKey]: CUSTOM_CODING_STANDARD_OPTION_VALUE
    },
    {
        [nameKey]: CUSTOM_RULE_SET_PATH_OPTION_NAME,
        [valueKey]: phpCSConfigFormattedPath
    },
    {
        [nameKey]: WARNING_HIGHLIGHT_LEVEL_NAME_OPTION_NAME,
        [valueKey]: WARNING_HIGHLIGHT_LEVEL_NAME_OPTION_VALUE
    },
    {
        [nameKey]: SHOW_SNIFF_NAMES_OPTION_NAME,
        [valueKey]: 'true'
    },
    {
        [nameKey]: USE_INSTALLED_PATHS_OPTION_NAME,
        [valueKey]: 'true'
    },
    {
        [nameKey]: INSTALLED_PATHS_OPTION_NAME,
        [valueKey]: phpCompatibilityFormattedPath
    },
    {
        [nameKey]: EXTENSIONS_OPTION_NAME,
        [valueKey]: 'php'
    }
];

const setupPhpCSValidationInspection = async (inspectionToolsData) => {
    let hasChanges = false;
    const phpCSConfig = inspectionToolsData.find(
        (inspectionToolData) => inspectionToolData[classKey] === PHP_CS_VALIDATION_INSPECTION
    );

    if (phpCSConfig) {
        const hasChangesInProperties = setupDefaultProperties(phpCSConfig);
        if (hasChangesInProperties) {
            hasChanges = true;
        }

        if (phpCSConfig.option) {
            const hasCodingStandardChanges = await setupCodingStandardOption(phpCSConfig);
            if (hasCodingStandardChanges) {
                hasChanges = true;
            }

            const hasCustomRuleSetChanges = await setupCustomRuleSetPathOption(phpCSConfig);
            if (hasCustomRuleSetChanges) {
                hasChanges = true;
            }

            const warningHighlightLevelNameOption = phpCSConfig.option.find(
                (option) => option[nameKey] === WARNING_HIGHLIGHT_LEVEL_NAME_OPTION_NAME
            );

            if (warningHighlightLevelNameOption && warningHighlightLevelNameOption[valueKey] !== WARNING_HIGHLIGHT_LEVEL_NAME_OPTION_VALUE) {
                hasChanges = true;
                warningHighlightLevelNameOption[valueKey] = WARNING_HIGHLIGHT_LEVEL_NAME_OPTION_VALUE;
            } else if (!warningHighlightLevelNameOption) {
                hasChanges = true;
                phpCSConfig.option.push({
                    [nameKey]: WARNING_HIGHLIGHT_LEVEL_NAME_OPTION_NAME,
                    [valueKey]: WARNING_HIGHLIGHT_LEVEL_NAME_OPTION_VALUE
                });
            }

            const showSniffNamesOption = phpCSConfig.option.find(
                (option) => option[nameKey] === SHOW_SNIFF_NAMES_OPTION_NAME
            );

            if (showSniffNamesOption && showSniffNamesOption[valueKey] !== 'true') {
                hasChanges = true;
                showSniffNamesOption[valueKey] = 'true';
            } else if (!showSniffNamesOption) {
                hasChanges = true;
                phpCSConfig.option.push({
                    [nameKey]: SHOW_SNIFF_NAMES_OPTION_NAME,
                    [valueKey]: 'true'
                });
            }

            const useInstalledPathsOption = phpCSConfig.option.find(
                (option) => option[nameKey] === USE_INSTALLED_PATHS_OPTION_NAME
            );

            if (useInstalledPathsOption && useInstalledPathsOption[valueKey] !== 'true') {
                hasChanges = true;
                useInstalledPathsOption[valueKey] = 'true';
            } else if (!useInstalledPathsOption) {
                hasChanges = true;
                phpCSConfig.option.push({
                    [nameKey]: USE_INSTALLED_PATHS_OPTION_NAME,
                    [valueKey]: 'true'
                });
            }

            const installedPathsOption = phpCSConfig.option.find(
                (option) => option[nameKey] === INSTALLED_PATHS_OPTION_NAME
            );

            if (!installedPathsOption) {
                if (await pathExists(phpCompatibilityRuleSetPath)) {
                    hasChanges = true;
                    phpCSConfig.option.push({
                        [nameKey]: INSTALLED_PATHS_OPTION_NAME,
                        [valueKey]: phpCompatibilityFormattedPath
                    });
                }
            }

            // we want php code sniffer to lint only php files
            // for other files (js, css, scss) we have separate linter setups
            const extensionsOption = phpCSConfig.option.find(
                (option) => option[nameKey] === EXTENSIONS_OPTION_NAME
            );

            if (extensionsOption && extensionsOption[valueKey] !== 'php') {
                hasChanges = true;
                extensionsOption[valueKey] = 'php';
            } else if (!extensionsOption) {
                hasChanges = true;
                phpCSConfig.option.push({
                    [nameKey]: EXTENSIONS_OPTION_NAME,
                    [valueKey]: 'php'
                });
            }
        } else {
            hasChanges = true;
            phpCSConfig.option = phpCSConfigDefaultOptions;
        }
    } else {
        hasChanges = true;

        const phpCSConfig = {
            [classKey]: PHP_CS_VALIDATION_INSPECTION,
            option: phpCSConfigDefaultOptions
        };

        setupDefaultProperties(phpCSConfig);

        inspectionToolsData.push(phpCSConfig);
    }

    return hasChanges;
};

module.exports = setupPhpCSValidationInspection;
