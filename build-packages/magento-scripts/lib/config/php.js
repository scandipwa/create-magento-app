const path = require('path');
const os = require('os');

module.exports = (app, config) => {
    const { php } = app;

    const { cacheDir, templateDir } = config;

    const phpVersionDir = path.join(
        os.homedir(),
        '.phpbrew',
        'php',
        `php-${ php.version }`
    );

    const phpConfiguration = {
        binPath: path.join(phpVersionDir, 'bin', 'php'),
        iniPath: path.join(cacheDir, 'php.ini'),
        iniTemplatePath: path.join(templateDir, 'php.template.ini'),
        fpmBinPath: path.resolve(phpVersionDir, 'sbin', 'php-fpm'),
        fpmConfPath: path.resolve(cacheDir, 'php-fpm.conf'),
        fpmPidFilePath: path.join(cacheDir, 'php-fpm.pid'),
        extensions: php.extensions,
        version: php.version
    };

    return phpConfiguration;
};
