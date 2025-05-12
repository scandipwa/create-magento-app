const os = require('os')
const UnknownError = require('../../errors/unknown-error')
const setConfigFile = require('../../util/set-config')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const createPhpFpmConfig = () => ({
    title: 'Setting php-fpm config',
    task: async (ctx) => {
        const {
            config: { php },
            isDockerDesktop
        } = ctx
        const port = !isDockerDesktop ? ctx.ports.fpm : 9000

        const user =
            ctx.platform === 'linux' ? os.userInfo().username : 'www-data'

        try {
            await setConfigFile({
                configPathname: php.fpmConfPath,
                template: php.fpmTemplatePath,
                overwrite: true,
                templateArgs: {
                    port,
                    user
                }
            })
        } catch (e) {
            throw new UnknownError(
                `Unexpected error accrued during php-fpm config creation\n\n${e}`
            )
        }
    }
})

module.exports = createPhpFpmConfig
