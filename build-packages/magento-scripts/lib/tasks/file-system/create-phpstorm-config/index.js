const setupWorkspaceConfig = require('./workspace-config');
const setupPhpConfig = require('./php-config');
const setupDatabaseConfig = require('./database-config');
const setupInspectionToolsConfig = require('./inspection-tools-config');
const setupExcludedFoldersConfig = require('./exclude-folder-config');
const setupStylelintConfig = require('./stylelint-config');
const setupESLintConfig = require('./eslint-config');

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const createPhpStormConfig = () => ({
    title: 'Setting PHPStorm config',
    task: (ctx, task) => task.newListr([
        setupWorkspaceConfig(),
        setupPhpConfig(),
        setupDatabaseConfig(),
        setupInspectionToolsConfig(),
        setupExcludedFoldersConfig(),
        setupStylelintConfig(),
        setupESLintConfig()
    ], {
        concurrent: true
    })
});

module.exports = createPhpStormConfig;
