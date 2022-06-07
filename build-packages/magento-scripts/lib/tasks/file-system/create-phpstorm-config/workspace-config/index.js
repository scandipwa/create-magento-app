const { loadXmlFile, buildXmlFile } = require('../../../../config/xml-parser');
const pathExists = require('../../../../util/path-exists');
const { getPhpConfig } = require('../php-config/php-config');
const { setupXMLStructure } = require('../setup-xml-structure');
const setupComposerSettings = require('./composer-settings-config');
const setupFormatOnSave = require('./format-setting-config');
const setupPHPDebugGeneral = require('./php-debug-general-config');
const setupPHPServers = require('./php-server-config');
const setupPropertiesComponent = require('./properties-component-config');
const setupRunManager = require('./run-manager-config');
const { getWorkspaceConfig } = require('./workspace-config');

/**
 * @type {() => import('listr2').ListrTask<import('../../../../../typings/context').ListrContext>}
 */
const setupWorkspaceConfig = () => ({
    title: 'Set up Workspace configuration',
    task: async (ctx, task) => {
        const workspaceConfig = getWorkspaceConfig(ctx.config.overridenConfiguration);
        const phpConfig = getPhpConfig(ctx.config.overridenConfiguration);
        if (await pathExists(workspaceConfig.path)) {
            const workspaceConfiguration = setupXMLStructure(await loadXmlFile(workspaceConfig.path));
            const workspaceConfigs = workspaceConfiguration.project.component;
            const hasChanges = await Promise.all([
                setupPHPDebugGeneral(workspaceConfigs, workspaceConfig),
                setupPHPServers(workspaceConfigs, workspaceConfig),
                setupRunManager(workspaceConfigs, workspaceConfig),
                setupPropertiesComponent(workspaceConfigs)
            ]);

            if (hasChanges.includes(true)) {
                await buildXmlFile(phpConfig.path, workspaceConfiguration);
            } else {
                task.skip();
            }

            return;
        }

        const workspaceConfiguration = setupXMLStructure();
        const workspaceConfigs = workspaceConfiguration.project.component;

        await Promise.all([
            setupPHPDebugGeneral(workspaceConfigs, workspaceConfig),
            setupPHPServers(workspaceConfigs, workspaceConfig),
            setupRunManager(workspaceConfigs, workspaceConfig),
            setupPropertiesComponent(workspaceConfigs),
            setupComposerSettings(workspaceConfigs),
            setupFormatOnSave(workspaceConfigs)
        ]);

        await buildXmlFile(workspaceConfig.path, workspaceConfiguration);
    }
});

module.exports = setupWorkspaceConfig;
