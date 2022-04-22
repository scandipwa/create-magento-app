const { loadXmlFile, buildXmlFile } = require('../../../../config/xml-parser');
const pathExists = require('../../../../util/path-exists');
const setConfigFile = require('../../../../util/set-config');
const setupMessDetector = require('./mess-detector-config');

/**
 * @type {() => import('listr2').ListrTask<import('../../../../../typings/context').ListrContext>}
 */
const setupPhpConfig = () => ({
    title: 'Set up PHP configuration',
    task: async (ctx, task) => {
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

        if (await pathExists(phpStorm.php.path)) {
            const phpConfigContent = await loadXmlFile(phpStorm.php.path);
            const phpConfigs = phpConfigContent.project.component;
            const hasChanges = await Promise.all([
                setupMessDetector(phpConfigs)
                // setupPhpCSValidationInspection(phpConfigs),
                // setupStyleLintInspection(phpConfigs),
                // setupMessDetectorValidationInspection(phpConfigs)
            ]);

            if (hasChanges.includes(true)) {
                await buildXmlFile(phpStorm.php.path, phpConfigContent);
            } else {
                task.skip();
            }

            return;
        }
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
