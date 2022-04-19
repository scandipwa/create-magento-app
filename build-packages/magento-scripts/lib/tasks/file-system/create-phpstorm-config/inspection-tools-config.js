const setConfigFile = require('../../../util/set-config');

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

        try {
            await setConfigFile({
                configPathname: phpStorm.inspectionTools.path,
                template: phpStorm.inspectionTools.templatePath,
                overwrite: true,
                templateArgs: {}
            });
        } catch (e) {
            throw new Error(`Unexpected error accrued during Project_Default.xml config creation\n\n${e}`);
        }
    }
});

module.exports = setupInspectionToolsConfig;
