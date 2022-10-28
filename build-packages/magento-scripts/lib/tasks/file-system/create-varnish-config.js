const path = require('path')
const UnknownError = require('../../errors/unknown-error')
const setConfigFile = require('../../util/set-config')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const createVarnishConfig = () => ({
    title: 'Setting Varnish config',
    skip: (ctx) =>
        !ctx.config.overridenConfiguration.configuration.varnish.enabled,
    task: async (ctx) => {
        const {
            ports,
            config: {
                overridenConfiguration,
                baseConfig: { cacheDir }
            },
            isDockerDesktop
        } = ctx

        const {
            configuration: { varnish }
        } = overridenConfiguration

        try {
            await setConfigFile({
                configPathname: path.join(cacheDir, 'varnish', 'default.vcl'),
                template: varnish.configTemplate,
                overwrite: true,
                templateArgs: {
                    hostMachine: !isDockerDesktop
                        ? '127.0.0.1'
                        : 'host.docker.internal',
                    nginxPort: ports.app,
                    healthCheck: varnish.healthCheck
                }
            })
        } catch (e) {
            throw new UnknownError(
                `Unexpected error accrued during varnish config creation\n\n${e}`
            )
        }
    }
})

module.exports = createVarnishConfig
