const path = require('path');
const { loadXmlFile, buildXmlFile } = require('../../../config/xml-parser');
const pathExists = require('../../../util/path-exists');
// const setConfigFile = require('../../../util/set-config');

const classKey = '@_class';
const nameKey = '@_name';
const valueKey = '@_value';

const PHP_CS_FIXER_VALIDATION_INSPECTION = 'PhpCSFixerValidationInspection';
const PHP_CS_VALIDATION_INSPECTION = 'PhpCSValidationInspection';
const STYLELINT_INSPECTION = 'Stylelint';

const CODING_STANDARD_OPTION_NAME = 'CODING_STANDARD';
const CUSTOM_CODING_STANDARD_OPTION_VALUE = 'Custom';
const CUSTOM_RULE_SET_PATH_OPTION_NAME = 'CUSTOM_RULESET_PATH';
const EXTENSIONS_OPTION_NAME = 'EXTENSIONS';
const WARNING_HIGHLIGHT_LEVEL_NAME_OPTION_NAME = 'WARNING_HIGHLIGHT_LEVEL_NAME';
const WARNING_HIGHLIGHT_LEVEL_NAME_OPTION_VALUE = 'ERROR';
const SHOW_SNIFF_NAMES_OPTION_NAME = 'SHOW_SNIFF_NAMES';
const USE_INSTALLED_PATHS_OPTION_NAME = 'USE_INSTALLED_PATHS';
const INSTALLED_PATHS_OPTION_NAME = 'INSTALLED_PATHS';

const phpCompatibilityPath = path.join(process.cwd(), 'vendor', 'phpcompatibility', 'php-compatibility', 'PHPCompatibility');
const phpCompatibilityRuleSetPath = path.join(phpCompatibilityPath, 'ruleset.xml');
const phpCompatibilityFormattedPath = phpCompatibilityPath.replace(process.cwd(), '$PROJECT_DIR$');
const phpCSConfigurationPath = path.join(process.cwd(), '.php_cs.dist');
const phpCSConfigFormattedPath = phpCSConfigurationPath.replace(process.cwd(), '$PROJECT_DIR$');

const setupCodingStandardOption = async (config) => {
    let hasChanges = false;
    if (config.option) {
        const codingStandardOption = config.option.find((option) => option[nameKey] === CODING_STANDARD_OPTION_NAME);
        if (!codingStandardOption) {
            hasChanges = true;
            config.option.push({
                [nameKey]: CODING_STANDARD_OPTION_NAME,
                [valueKey]: CUSTOM_CODING_STANDARD_OPTION_VALUE
            });
        } else if (codingStandardOption[valueKey] !== CUSTOM_CODING_STANDARD_OPTION_VALUE) {
            hasChanges = true;
            codingStandardOption[valueKey] = CUSTOM_CODING_STANDARD_OPTION_VALUE;
        }
    } else {
        hasChanges = true;
        config.option = [
            {
                [nameKey]: CODING_STANDARD_OPTION_NAME,
                [valueKey]: CUSTOM_CODING_STANDARD_OPTION_VALUE
            },
            {
                [nameKey]: CUSTOM_RULE_SET_PATH_OPTION_NAME,
                [valueKey]: phpCSConfigFormattedPath
            }
        ];
    }

    return hasChanges;
};

const setupCustomRuleSetPathOption = async (config) => {
    let hasChanges = false;
    const customRuleSetPathOption = config.option.find((option) => option[nameKey] === CUSTOM_RULE_SET_PATH_OPTION_NAME);
    const phpCSConfigExists = await pathExists(phpCSConfigurationPath);
    if (!customRuleSetPathOption && phpCSConfigExists) {
        hasChanges = true;
        config.option.push({
            [nameKey]: CUSTOM_RULE_SET_PATH_OPTION_NAME,
            [valueKey]: phpCSConfigFormattedPath
        });
    } else if (customRuleSetPathOption && customRuleSetPathOption[valueKey] !== phpCSConfigFormattedPath) {
        hasChanges = true;
        customRuleSetPathOption[valueKey] = phpCSConfigFormattedPath;
    }

    return hasChanges;
};

/**
 * @param {Array} inspectionToolsData
 * @returns {Promise<Boolean>}
 */
const setupPhpCSFixerValidationInspection = async (inspectionToolsData) => {
    let hasChanges = false;
    const phpCSFixerConfig = inspectionToolsData.find((inspectionToolData) => inspectionToolData[classKey] === PHP_CS_FIXER_VALIDATION_INSPECTION);

    if (phpCSFixerConfig) {
        if (phpCSFixerConfig['@_enabled'] !== 'true') {
            hasChanges = true;
            phpCSFixerConfig['@_enabled'] = 'true';
        }

        if (!phpCSFixerConfig['@_enabled_by_default']) {
            hasChanges = true;
            phpCSFixerConfig['@_enabled_by_default'] = 'true';
        }

        if (!phpCSFixerConfig['@_level']) {
            hasChanges = true;
            phpCSFixerConfig['@_level'] = 'ERROR';
        }

        const hasCodingStandardChanges = await setupCodingStandardOption(phpCSFixerConfig);
        if (hasCodingStandardChanges) {
            hasChanges = true;
        }

        const hasCustomRuleSetChanges = await setupCustomRuleSetPathOption(phpCSFixerConfig);
        if (hasCustomRuleSetChanges) {
            hasChanges = true;
        }
    } else {
        hasChanges = true;
        inspectionToolsData.push({
            [classKey]: PHP_CS_FIXER_VALIDATION_INSPECTION,
            '@_enabled': 'true',
            '@_level': 'ERROR',
            '@_enabled_by_default': 'true',
            option: [
                {
                    [nameKey]: CODING_STANDARD_OPTION_NAME,
                    [valueKey]: CUSTOM_CODING_STANDARD_OPTION_VALUE
                },
                {
                    [nameKey]: CUSTOM_RULE_SET_PATH_OPTION_NAME,
                    [valueKey]: phpCSConfigFormattedPath
                }
            ]
        });
    }

    return hasChanges;
};

const setupPhpCSValidationInspection = async (inspectionToolsData) => {
    let hasChanges = false;
    const phpCSConfig = inspectionToolsData.find((inspectionToolData) => inspectionToolData[classKey] === PHP_CS_VALIDATION_INSPECTION);

    if (phpCSConfig) {
        if (phpCSConfig['@_enabled'] !== 'true') {
            hasChanges = true;
            phpCSConfig['@_enabled'] = 'true';
        }

        if (!phpCSConfig['@_enabled_by_default']) {
            hasChanges = true;
            phpCSConfig['@_enabled_by_default'] = 'true';
        }

        if (!phpCSConfig['@_level']) {
            hasChanges = true;
            phpCSConfig['@_level'] = 'ERROR';
        }

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

        const showSniffNamesOption = phpCSConfig.option.find((option) => option[nameKey] === SHOW_SNIFF_NAMES_OPTION_NAME);
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

        const useInstalledPathsOption = phpCSConfig.option.find((option) => option[nameKey] === USE_INSTALLED_PATHS_OPTION_NAME);
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

        const installedPathsOption = phpCSConfig.option.find((option) => option[nameKey] === INSTALLED_PATHS_OPTION_NAME);
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
        const extensionsOption = phpCSConfig.option.find((option) => option[nameKey] === EXTENSIONS_OPTION_NAME);
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
        inspectionToolsData.push({
            [classKey]: PHP_CS_VALIDATION_INSPECTION,
            '@_enabled': 'true',
            '@_level': 'ERROR',
            '@_enabled_by_default': 'true',
            option: [
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
            ]
        });
    }

    return hasChanges;
};

/**
 * @param {Array} inspectionToolsData
 * @returns {Boolean}
 */
const setupStyleLintInspection = (inspectionToolsData) => {
    let hasChanges = false;
    const stylelintConfig = inspectionToolsData.find((inspectionToolData) => inspectionToolData[classKey] === STYLELINT_INSPECTION);
    if (!stylelintConfig) {
        hasChanges = true;
        inspectionToolsData.push({
            [classKey]: STYLELINT_INSPECTION,
            '@_enabled': 'true',
            '@_level': 'ERROR',
            '@_enabled_by_default': 'true'
        });
    } else {
        const expectedStylelintConfig = {
            '@_enabled': 'true',
            '@_level': 'ERROR',
            '@_enabled_by_default': 'true'
        };

        const isStylelintChangeNeeded = Object.entries(expectedStylelintConfig)
            .some(([key, value]) => stylelintConfig[key] !== value);

        if (isStylelintChangeNeeded) {
            hasChanges = true;
            Object.entries(expectedStylelintConfig).forEach(([key, value]) => {
                stylelintConfig[key] = value;
            });
        }
    }

    return hasChanges;
};
/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const setupInspectionToolsConfig = () => ({
    title: 'Set up inspection tools configuration',
    task: async (ctx) => {
        const {
            config: {
                phpStorm
            }
        } = ctx;

        if (await pathExists(phpStorm.inspectionTools.path)) {
            let hasChanges = false;
            const inspectionToolsData = await loadXmlFile(phpStorm.inspectionTools.path);
            const inspectionTools = inspectionToolsData.component.profile.inspection_tool;
            const hasPHPCSFixerChanges = await setupPhpCSFixerValidationInspection(inspectionTools);
            if (hasPHPCSFixerChanges) {
                hasChanges = true;
            }
            const hasPHPCSChanges = await setupPhpCSValidationInspection(inspectionTools);
            if (hasPHPCSChanges) {
                hasChanges = true;
            }

            const hasStylelintChanges = setupStyleLintInspection(inspectionTools);
            if (hasStylelintChanges) {
                hasChanges = true;
            }

            if (hasChanges) {
                await buildXmlFile(phpStorm.inspectionTools.path, inspectionToolsData);
            }
            console.log(inspectionToolsData);
        } else {
            const inspectionToolsData = {
                component: {
                    [nameKey]: 'InspectionProjectProfileManager',
                    profile: {
                        '@_version': '1.0',
                        option: {
                            [nameKey]: 'myName',
                            [valueKey]: 'Project Default'
                        },
                        inspection_tool: []
                    }
                }
            };
            const inspectionTools = inspectionToolsData.component.profile.inspection_tool;

            await setupPhpCSFixerValidationInspection(inspectionTools);
            await setupPhpCSValidationInspection(inspectionTools);
            setupStyleLintInspection(inspectionTools);

            console.log(inspectionToolsData);
        }

        // try {
        //     await setConfigFile({
        //         configPathname: phpStorm.inspectionTools.path,
        //         template: phpStorm.inspectionTools.templatePath,
        //         overwrite: true,
        //         templateArgs: {}
        //     });
        // } catch (e) {
        //     throw new Error(`Unexpected error accrued during Project_Default.xml config creation\n\n${e}`);
        // }
    }
});

module.exports = setupInspectionToolsConfig;
