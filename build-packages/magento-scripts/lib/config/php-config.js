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

    /**
     * @type {import('../../typings/context').ListrContext['config']['php']}
     */
    const phpConfiguration = {
        iniPath: path.join(cacheDir, 'php.ini'),
        iniTemplatePath: php.configTemplate,
        debugIniPath: path.join(cacheDir, 'xdebug.ini'),
        debugTemplatePath: php.debugTemplate,
        fpmTemplatePath: php.fpmConfigTemplate,
        fpmConfPath: path.join(cacheDir, 'php-fpm.conf'),
        debugFpmConfPath: path.join(cacheDir, 'php-fpm-debug.conf'),
        extensions: php.extensions,
        env: php.env
    }

    return phpConfiguration
}
