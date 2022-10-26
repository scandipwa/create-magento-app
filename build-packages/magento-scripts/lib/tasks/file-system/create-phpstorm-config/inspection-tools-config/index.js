const { loadXmlFile, buildXmlFile } = require('../../../../config/xml-parser')
const pathExists = require('../../../../util/path-exists')
const { nameKey, valueKey, classKey } = require('../keys')
const setupESLintInspection = require('./eslint-inspection-config')
const { getInspectionToolsConfig } = require('./inspection-tools-config')
const setupMessDetectorValidationInspection = require('./mess-detector-validation-inspection-config')
const setupPhpCSFixerValidationInspection = require('./php-cs-fixer-validation-inspection-config')
const setupPhpCSValidationInspection = require('./php-cs-validation-inspection-config')
const setupStyleLintInspection = require('./stylelint-inspection-config')

const inspectionProfileDefaults = {
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
}

/**
 * @returns {import('listr2').ListrTask<import('../../../../../typings/context').ListrContext>}
 */
const setupInspectionToolsConfigTask = () => ({
    title: 'Set up inspection tools configuration',
    task: async (ctx, task) => {
        const inspectionToolsConfig = getInspectionToolsConfig()
        if (await pathExists(inspectionToolsConfig.path)) {
            const inspectionToolsData = await loadXmlFile(
                inspectionToolsConfig.path
            )

            if (!inspectionToolsData.component) {
                inspectionToolsData.component =
                    inspectionProfileDefaults.component
            }

            if (!inspectionToolsData.component.profile) {
                inspectionToolsData.component.profile =
                    inspectionProfileDefaults.component.profile
            }

            if (!inspectionToolsData.component.profile.inspection_tool) {
                inspectionToolsData.component.profile.inspection_tool = []
            }

            if (
                !Array.isArray(
                    inspectionToolsData.component.profile.inspection_tool
                ) &&
                Boolean(inspectionToolsData.component.profile.inspection_tool)
            ) {
                inspectionToolsData.component.profile.inspection_tool = [
                    inspectionToolsData.component.profile.inspection_tool
                ]
            }

            const inspectionTools =
                inspectionToolsData.component.profile.inspection_tool
            const hasChanges = await Promise.all([
                setupPhpCSFixerValidationInspection(inspectionTools),
                setupPhpCSValidationInspection(inspectionTools),
                setupStyleLintInspection(inspectionTools),
                setupMessDetectorValidationInspection(inspectionTools)
            ])

            if (hasChanges.includes(true)) {
                await buildXmlFile(
                    inspectionToolsConfig.path,
                    inspectionToolsData
                )
            } else {
                task.skip()
            }

            return
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
        }
        const inspectionTools =
            inspectionToolsData.component.profile.inspection_tool

        await Promise.all([
            setupPhpCSFixerValidationInspection(inspectionTools),
            setupPhpCSValidationInspection(inspectionTools),
            setupStyleLintInspection(inspectionTools),
            setupMessDetectorValidationInspection(inspectionTools),
            setupStyleLintInspection(inspectionTools),
            setupESLintInspection(inspectionTools)
        ])

        await buildXmlFile(inspectionToolsConfig.path, inspectionToolsData)
    }
})

module.exports = setupInspectionToolsConfigTask
