const createNginxConfig = require('./create-nginx-config');
const createPhpConfig = require('./create-php-config');
const createPhpFpmConfig = require('./create-php-fpm-config');
const createPortConfig = require('./create-port-config');
const createComposerConfig = require('./create-composer-config');

const prepareFileSystem = {
    title: 'Preparing file system',
    task: async (ctx, task) => task.newListr([
        createPortConfig,
        createNginxConfig,
        createPhpFpmConfig,
        createPhpConfig,
        createComposerConfig
    ], {
        concurrent: true,
        rendererOptions: {
            collapse: false
        },
        exitOnError: true,
        ctx
    })
};

module.exports = {
    prepareFileSystem
};
