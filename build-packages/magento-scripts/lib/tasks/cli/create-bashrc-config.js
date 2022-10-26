const path = require('path')
const UnknownError = require('../../errors/unknown-error')
const setConfigFile = require('../../util/set-config')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const createBashrcConfigFile = () => ({
    title: 'Setting Bashrc config',
    task: async (ctx) => {
        const {
            config: { php, baseConfig, overridenConfiguration }
        } = ctx
        const varnishEnabled =
            overridenConfiguration.configuration.varnish.enabled
        try {
            await setConfigFile({
                configPathname: path.join(baseConfig.cacheDir, '.magentorc'),
                template: path.join(
                    baseConfig.templateDir,
                    'magentorc.template'
                ),
                overwrite: true,
                templateArgs: {
                    php,
                    varnishEnabled,
                    config: ctx.config,
                    magentoVersion: ctx.magentoVersion
                }
            })
        } catch (e) {
            throw new UnknownError(
                `Unexpected error accrued during .magentorc config creation\n\n${e}`
            )
        }
    }
})

module.exports = createBashrcConfigFile
