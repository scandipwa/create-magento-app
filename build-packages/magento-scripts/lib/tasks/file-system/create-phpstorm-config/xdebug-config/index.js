const { loadXmlFile, buildXmlFile } = require('../../../../config/xml-parser');
const pathExists = require('../../../../util/path-exists');
const setupComposerSettings = require('./composer-settings-config');
const setupPHPDebugGeneral = require('./php-debug-general-config');
const setupPHPServers = require('./php-server-config');
const setupRunManager = require('./run-manager-config');

/**
 * @type {() => import('listr2').ListrTask<import('../../../../../typings/context').ListrContext>}
 */
const setupXDebugConfig = () => ({
    title: 'Set up XDebug configuration',
    task: async (ctx, task) => {
        const {
            config: {
                phpStorm
            }
        } = ctx;

        if (await pathExists(phpStorm.xdebug.path)) {
            const workspaceConfiguration = await loadXmlFile(phpStorm.xdebug.path);
            const workspaceConfigs = workspaceConfiguration.project.component;
            const hasChanges = await Promise.all([
                setupPHPDebugGeneral(workspaceConfigs, phpStorm),
                setupPHPServers(workspaceConfigs, phpStorm),
                setupRunManager(workspaceConfigs, phpStorm),
                setupComposerSettings(workspaceConfigs)
            ]);

            if (hasChanges.includes(true)) {
                await buildXmlFile(phpStorm.php.path, workspaceConfiguration);
            } else {
                task.skip();
            }

            return;
        }

        const workspaceConfiguration = {
            '?xml': {
                '@_version': '1.0',
                '@_encoding': 'UTF-8'
            },
            project: {
                '@_version': '4',
                component: []
            }
        };
        const workspaceConfigs = workspaceConfiguration.project.component;

        await Promise.all([
            setupPHPDebugGeneral(workspaceConfigs, phpStorm),
            setupPHPServers(workspaceConfigs, phpStorm),
            setupRunManager(workspaceConfigs, phpStorm),
            setupComposerSettings(workspaceConfigs)
        ]);

        await buildXmlFile(phpStorm.php.path, workspaceConfiguration);
    }
});

module.exports = setupXDebugConfig;
