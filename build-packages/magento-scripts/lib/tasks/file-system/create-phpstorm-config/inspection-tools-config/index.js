const { loadXmlFile, buildXmlFile } = require('../../../../config/xml-parser');
const pathExists = require('../../../../util/path-exists');
const {
    nameKey,
    valueKey,
    classKey
} = require('../keys');
const setupMessDetectorValidationInspection = require('./mess-detector-validation-inspection-config');
const setupPhpCSFixerValidationInspection = require('./php-cs-fixer-validation-inspection-config');
const setupPhpCSValidationInspection = require('./php-cs-validation-inspection-config');
const setupStyleLintInspection = require('./stylelint-inspection-config');

/**
 * @type {() => import('listr2').ListrTask<import('../../../../../typings/context').ListrContext>}
 */
const setupInspectionToolsConfig = () => ({
    title: 'Set up inspection tools configuration',
    task: async (ctx, task) => {
        const {
            config: {
                phpStorm
            }
        } = ctx;

        if (await pathExists(phpStorm.inspectionTools.path)) {
            const inspectionToolsData = await loadXmlFile(phpStorm.inspectionTools.path);
            const inspectionTools = inspectionToolsData.component.profile.inspection_tool;
            const hasChanges = await Promise.all([
                setupPhpCSFixerValidationInspection(inspectionTools),
                setupPhpCSValidationInspection(inspectionTools),
                setupStyleLintInspection(inspectionTools),
                setupMessDetectorValidationInspection(inspectionTools)
            ]);

            if (hasChanges.includes(true)) {
                await buildXmlFile(phpStorm.inspectionTools.path, inspectionToolsData);
            } else {
                task.skip();
            }

            return;
        }

        const inspectionToolsData = {
            component: {
                [nameKey]: 'InspectionProjectProfileManager',
                profile: {
                    '@_version': '1.0',
                    option: {
                        [nameKey]: 'myName',
                        [valueKey]: 'Project Default'
                    },
                    inspection_tool: [
                        {
                            [classKey]: 'PhpStanGlobal',
                            '@_enabled': 'true',
                            '@_level': 'ERROR',
                            '@_enabled_by_default': 'true'
                        }
                    ]
                }
            }
        };
        const inspectionTools = inspectionToolsData.component.profile.inspection_tool;

        await Promise.all([
            setupPhpCSFixerValidationInspection(inspectionTools),
            setupPhpCSValidationInspection(inspectionTools),
            setupStyleLintInspection(inspectionTools),
            setupMessDetectorValidationInspection(inspectionTools)
        ]);

        await buildXmlFile(phpStorm.inspectionTools.path, inspectionToolsData);
    }
});

module.exports = setupInspectionToolsConfig;
