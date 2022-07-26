const path = require('path');

/**
 * @param {import('../../typings/context').ListrContext['config']['overridenConfiguration']} overridenConfiguration
 * @param {import('../../typings/context').ListrContext['config']['baseConfig']} baseConfig
 */
module.exports = (overridenConfiguration, baseConfig) => {
    const { php } = overridenConfiguration;

    const { cacheDir } = baseConfig;

    const phpConfiguration = {
        iniPath: path.join(cacheDir, 'php.ini'),
        iniTemplatePath: php.configTemplate,
        fpmTemplatePath: php.fpmConfigTemplate,
        fpmConfPath: path.join(cacheDir, 'php-fpm.conf'),
        extensions: php.extensions,
        version: php.version
    };

    return phpConfiguration;
};
