const createNginxConfig = require('./create-nginx-config');
const createPhpConfig = require('./create-php-config');
const createPhpFpmConfig = require('./create-php-fpm-config');
const createPhpStormConfig = require('./create-phpstorm-config');
const createSSLTerminatorConfig = require('./create-ssl-terminator-config');
const createVarnishConfig = require('./create-varnish-config');
const createVSCodeConfig = require('./create-vscode-config');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const prepareFileSystem = () => ({
    title: 'Preparing file system',
    task: (ctx, task) => task.newListr([
        createSSLTerminatorConfig(),
        createNginxConfig(),
        createPhpFpmConfig(),
        createPhpConfig(),
        createPhpStormConfig(),
        createVSCodeConfig(),
        createVarnishConfig()
    ], {
        concurrent: true,
        exitOnError: false
    })
});

module.exports = {
    prepareFileSystem
};
