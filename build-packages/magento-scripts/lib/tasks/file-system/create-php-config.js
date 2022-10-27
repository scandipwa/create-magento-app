const UnknownError = require('../../errors/unknown-error')
const setConfigFile = require('../../util/set-config')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const createPhpConfig = () => ({
    title: 'Setting PHP config',
    task: async (ctx) => {
        const {
            config: { php }
        } = ctx

        try {
            await setConfigFile({
                configPathname: php.iniPath,
                template: php.iniTemplatePath,
                overwrite: true
            })
        } catch (e) {
            throw new UnknownError(
                `Unexpected error accrued during php.ini config creation\n\n${e}`
            )
        }
    }
})

module.exports = createPhpConfig
