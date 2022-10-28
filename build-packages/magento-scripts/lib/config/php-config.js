const path = require('path')

/**
 * @param {import('../../typings/context').ListrContext['config']['overridenConfiguration']} overridenConfiguration
 * @param {import('../../typings/context').ListrContext['config']['baseConfig']} baseConfig
 */
module.exports = (overridenConfiguration, baseConfig) => {
    const {
        configuration: { php }
    } = overridenConfiguration

    const { cacheDir } = baseConfig

    const phpConfiguration = {
        iniPath: path.join(cacheDir, 'php.ini'),
        iniTemplatePath: php.configTemplate,
        debugIniPath: path.join(cacheDir, 'xdebug.ini'),
        debugTemplatePath: php.debugTemplate,
        fpmTemplatePath: php.fpmConfigTemplate,
        fpmConfPath: path.join(cacheDir, 'php-fpm.conf'),
        extensions: php.extensions
    }

    return phpConfiguration
}
