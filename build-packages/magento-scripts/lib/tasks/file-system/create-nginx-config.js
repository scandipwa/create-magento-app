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

        const hostMachine = !isDockerDesktop
            ? '127.0.0.1'
            : 'host.docker.internal'
        const hostPort = !isDockerDesktop ? ports.app : 80
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
                    ports,
                    mageRoot: baseConfig.containerMagentoDir,
                    hostMachine,
                    hostPort,
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
