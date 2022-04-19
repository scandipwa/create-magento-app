const setConfigFile = require('../../../util/set-config');

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const setupXDebugConfig = () => ({
    title: 'Set up XDebug configuration',
    task: async (ctx) => {
        const {
            config: {
                phpStorm
            }
        } = ctx;

        try {
            await setConfigFile({
                configPathname: phpStorm.xdebug.path,
                template: phpStorm.xdebug.templatePath,
                overwrite: true,
                templateArgs: {
                    phpStorm
                }
            });
        } catch (e) {
            throw new Error(`Unexpected error accrued during workspace.xml config creation\n\n${e}`);
        }
    }
});

module.exports = setupXDebugConfig;
