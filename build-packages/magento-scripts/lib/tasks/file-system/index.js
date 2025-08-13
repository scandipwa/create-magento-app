const createGitHookNotification = require('./create-git-hook-notification')
const createMariaDBConfig = require('./create-mariadb-config')
const createNginxConfig = require('./create-nginx-config')
const createPhpConfig = require('./create-php-config')
const createPhpDebugConfig = require('./create-php-debug-config')
const createPhpFpmConfig = require('./create-php-fpm-config')
const createPhpFpmDebugConfig = require('./create-php-fpm-debug-config')
const createPhpStormConfig = require('./create-phpstorm-config')
const createSSLTerminatorConfig = require('./create-ssl-terminator-config')
const createVarnishConfig = require('./create-varnish-config')
const createVSCodeConfig = require('./create-vscode-config')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const prepareFileSystem = () => ({
    title: 'Preparing file system',
    task: (ctx, task) =>
        task.newListr(
            [
                createSSLTerminatorConfig(),
                createNginxConfig(),
                createPhpFpmConfig(),
                createPhpFpmDebugConfig(),
                createPhpConfig(),
                createPhpDebugConfig(),
                createPhpStormConfig(),
                createVSCodeConfig(),
                createVarnishConfig(),
                createMariaDBConfig(),
                createGitHookNotification()
            ],
            {
                concurrent: true
            }
        )
})

module.exports = {
    prepareFileSystem
}
