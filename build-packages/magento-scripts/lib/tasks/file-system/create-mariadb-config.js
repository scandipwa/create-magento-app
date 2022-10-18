const path = require('path')
const UnknownError = require('../../errors/unknown-error')
const setConfigFile = require('../../util/set-config')

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const createMariaDBConfig = () => ({
    title: 'Setting MariaDB config',
    task: async (ctx) => {
        try {
            await setConfigFile({
                configPathname: path.join(
                    ctx.config.baseConfig.cacheDir,
                    'mariadb.cnf'
                ),
                template: path.join(
                    ctx.config.baseConfig.templateDir,
                    'mariadb.template.cnf'
                ),
                overwrite: true
            })
        } catch (e) {
            throw new UnknownError(
                `Unexpected error accrued during php-fpm config creation\n\n${e}`
            )
        }
    }
})

module.exports = createMariaDBConfig
