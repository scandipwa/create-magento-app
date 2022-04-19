const setConfigFile = require('../../../util/set-config');

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const setupPhpConfig = () => ({
    title: 'Set up PHP configuration',
    task: async (ctx) => {
        const {
            config: {
                phpStorm,
                phpStorm: {
                    php: {
                        phpLanguageLevel
                    }
                }
            }
        } = ctx;

        try {
            await setConfigFile({
                configPathname: phpStorm.php.path,
                template: phpStorm.php.templatePath,
                overwrite: true,
                templateArgs: {
                    phpLanguageLevel
                }
            });
        } catch (e) {
            throw new Error(`Unexpected error accrued during php.xml config creation\n\n${e}`);
        }
    }
});

module.exports = setupPhpConfig;
