const path = require('path')
const setConfigFile = require('../../util/set-config')
const UnknownError = require('../../errors/unknown-error')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const createNginxConfig = () => ({
    title: 'Setting nginx config',
    task: async (ctx) => {
        const {
            ports,
            config: { overridenConfiguration, baseConfig },
            isDockerDesktop
        } = ctx

        const {
            configuration: { nginx },
            storeDomains
        } = overridenConfiguration

        const networkSettings = {
            phpNetwork: '127.0.0.1',
            phpWithXdebugNetwork: '127.0.0.1',
            fpmPort: ports.fpm,
            fpmXdebugPort: ports.fpmXdebug,
            hostPort: ports.app
        }

        if (isDockerDesktop) {
            networkSettings.phpNetwork = 'host.docker.internal'
            networkSettings.phpWithXdebugNetwork = 'host.docker.internal'

            networkSettings.hostPort = 80
        }

        const useStoreDomainMapping =
            storeDomains && Object.keys(storeDomains).length > 1

        try {
            await setConfigFile({
                configPathname: path.join(
                    baseConfig.cacheDir,
                    'nginx',
                    'conf.d',
                    'default.conf'
                ),
                template: nginx.configTemplate,
                overwrite: true,
                templateArgs: {
                    ...networkSettings,
                    mageRoot: baseConfig.containerMagentoDir,
                    config: overridenConfiguration,
                    storeDomains,
                    useStoreDomainMapping
                }
            })
        } catch (e) {
            throw new UnknownError(
                `Unexpected error accrued during nginx config creation\n\n${e}`
            )
        }
    }
})

module.exports = createNginxConfig
