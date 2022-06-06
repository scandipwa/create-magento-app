const { loadXmlFile, buildXmlFile } = require('../../../../config/xml-parser');
const pathExists = require('../../../../util/path-exists');
const { setupXMLStructure } = require('../setup-xml-structure');
const setupComposerSettings = require('./composer-settings-config');
const setupFormatOnSave = require('./format-setting-config');
const setupPHPDebugGeneral = require('./php-debug-general-config');
const setupPHPServers = require('./php-server-config');
const setupPropertiesComponent = require('./properties-component-config');
const setupRunManager = require('./run-manager-config');

/**
 * @type {() => import('listr2').ListrTask<import('../../../../../typings/context').ListrContext>}
 */
const setupWorkspaceConfig = () => ({
    title: 'Set up Workspace configuration',
    task: async (ctx, task) => {
        const {
            config: {
                phpStorm
            }
        } = ctx;

        if (await pathExists(phpStorm.xdebug.path)) {
            const workspaceConfiguration = setupXMLStructure(await loadXmlFile(phpStorm.xdebug.path));
            const workspaceConfigs = workspaceConfiguration.project.component;
            const hasChanges = await Promise.all([
                setupPHPDebugGeneral(workspaceConfigs, phpStorm),
                setupPHPServers(workspaceConfigs, phpStorm),
                setupRunManager(workspaceConfigs, phpStorm),
                setupPropertiesComponent(workspaceConfigs)
            ]);

            if (hasChanges.includes(true)) {
                await buildXmlFile(phpStorm.php.path, workspaceConfiguration);
            } else {
                task.skip();
            }

            return;
        }

        const workspaceConfiguration = setupXMLStructure();
        const workspaceConfigs = workspaceConfiguration.project.component;

        await Promise.all([
            setupPHPDebugGeneral(workspaceConfigs, phpStorm),
            setupPHPServers(workspaceConfigs, phpStorm),
            setupRunManager(workspaceConfigs, phpStorm),
            setupPropertiesComponent(workspaceConfigs),
            setupComposerSettings(workspaceConfigs),
            setupFormatOnSave(workspaceConfigs)
        ]);

        await buildXmlFile(phpStorm.xdebug.path, workspaceConfiguration);
    }
});

module.exports = setupWorkspaceConfig;
