const setupXDebugConfig = require('./xdebug-config');
const setupPhpConfig = require('./php-config');
const setupDatabaseConfig = require('./database-config');
const setupInspectionToolsConfig = require('./inspection-tools-config');
const setupExcludedFoldersConfig = require('./exclude-folder-config');
const setupStylelintConfig = require('./stylelint-config');

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const createPhpStormConfig = () => ({
    title: 'Setting PHPStorm config',
    task: (ctx, task) => task.newListr([
        setupXDebugConfig(),
        setupPhpConfig(),
        setupDatabaseConfig(),
        setupInspectionToolsConfig(),
        setupExcludedFoldersConfig(),
        setupStylelintConfig()
    ], {
        concurrent: true
    })
});

module.exports = createPhpStormConfig;
