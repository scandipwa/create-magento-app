const path = require('path');

module.exports = (app, config) => {
    const { php } = app;

    const { cacheDir } = config;

    const phpConfiguration = {
        iniPath: path.join(cacheDir, 'php.ini'),
        iniTemplatePath: php.configTemplate,
        fpmConfPath: path.join(cacheDir, 'php-fpm.conf'),
        extensions: php.extensions,
        version: php.version
    };

    return phpConfiguration;
};
