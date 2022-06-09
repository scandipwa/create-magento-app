const path = require('path');
const os = require('os');

module.exports = (app, config) => {
    const { php } = app;

    const { cacheDir } = config;

    const phpVersionDir = path.join(
        os.homedir(),
        '.phpbrew',
        'php',
        `php-${ php.version }`
    );

    const phpConfiguration = {
        binPath: path.join(phpVersionDir, 'bin', 'php'),
        iniPath: path.join(cacheDir, 'php.ini'),
        iniTemplatePath: php.configTemplate,
        fpmBinPath: path.join(phpVersionDir, 'sbin', 'php-fpm'),
        fpmConfPath: path.join(cacheDir, 'php-fpm.conf'),
        fpmPidFilePath: path.join(cacheDir, 'php-fpm.pid'),
        extensions: php.extensions,
        version: php.version
    };

    return phpConfiguration;
};
