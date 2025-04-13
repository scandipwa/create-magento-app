const UnknownError = require('../../errors/unknown-error')
const setConfigFile = require('../../util/set-config')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const createPhpFpmDebugConfig = () => ({
    title: 'Setting php-fpm debug config',
    task: async (ctx) => {
        const {
            config: { php },
            isDockerDesktop
        } = ctx
        const port = !isDockerDesktop ? ctx.ports.fpmXdebug : 9000

        try {
            await setConfigFile({
                configPathname: php.debugFpmConfPath,
                template: php.fpmTemplatePath,
                overwrite: true,
                templateArgs: {
                    port
                }
            })
        } catch (e) {
            throw new UnknownError(
                `Unexpected error accrued during php-fpm config creation\n\n${e}`
            )
        }
    }
})

module.exports = createPhpFpmDebugConfig
