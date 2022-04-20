const { loadXmlFile } = require('../../../config/xml-parser');
const pathExists = require('../../../util/path-exists');
// const setConfigFile = require('../../../util/set-config');

const setupPhpCSFixer = (inspectionToolsData) => {
    const phpCSFixerConfig = inspectionToolsData.find((inspectionToolData) => inspectionToolData['@_class'] === 'PhpCSFixerValidationInspection');
    if (!phpCSFixerConfig) {
        inspectionToolsData.push({
            option: [
                {
                    '@_name': 'CODING_STANDARD',
                    '@_value': 'Custom'
                },
                {
                    '@_name': 'CUSTOM_RULESET_PATH',
                    '@_value': '$PROJECT_DIR$/.php_cs.dist'
                }
            ],
            '@_class': 'PhpCSFixerValidationInspection',
            '@_enabled': 'true',
            '@_level': 'ERROR',
            '@_enabled_by_default': 'true'
        });
    }
};

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const setupInspectionToolsConfig = () => ({
    title: 'Set up inspection tools configuration',
    task: async (ctx) => {
        const {
            config: {
                phpStorm: {
                    inspectionTools
                }
            }
        } = ctx;

        if (await pathExists(inspectionTools.path)) {
            const inspectionToolsData = await loadXmlFile(inspectionTools.path);
            setupPhpCSFixer(inspectionToolsData.component.profile.inspection_tool);
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
