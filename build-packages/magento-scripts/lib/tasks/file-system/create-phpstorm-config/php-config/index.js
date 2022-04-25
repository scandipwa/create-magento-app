const { loadXmlFile, buildXmlFile } = require('../../../../config/xml-parser');
const pathExists = require('../../../../util/path-exists');
const setupMessDetector = require('./mess-detector-config');
const setupPHPCodeSniffer = require('./php-code-sniffer-config');
const setupPHPCSFixer = require('./php-cs-fixer-config');
const setupPHPProjectSharedConfiguration = require('./php-project-shared-configuration-config');

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
                setupMessDetector(phpConfigs),
                setupPHPCodeSniffer(phpConfigs),
                setupPHPCSFixer(phpConfigs),
                setupPHPProjectSharedConfiguration(phpConfigs, phpLanguageLevel)
            ]);

            if (hasChanges.includes(true)) {
                await buildXmlFile(phpStorm.php.path, phpConfigContent);
            } else {
                task.skip();
            }

            return;
        }

        const phpConfigContent = {
            '?xml': {
                '@_version': '1.0',
                '@_encoding': 'UTF-8'
            },
            project: {
                '@_version': '4',
                component: []
            }
        };
        const phpConfigs = phpConfigContent.project.component;

        await Promise.all([
            setupMessDetector(phpConfigs),
            setupPHPCodeSniffer(phpConfigs),
            setupPHPCSFixer(phpConfigs),
            setupPHPProjectSharedConfiguration(phpConfigs, phpLanguageLevel)
        ]);

        await buildXmlFile(phpStorm.php.path, phpConfigContent);
    }
});

module.exports = setupPhpConfig;
