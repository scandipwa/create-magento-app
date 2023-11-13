const path = require('path')
const UnknownError = require('../../errors/unknown-error')
const setConfigFile = require('../../util/set-config')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
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
                overwrite: true,
                templateArgs: {
                    config: {
                        useOptimizerSwitch:
                            ctx.config.overridenConfiguration.configuration
                                .mariadb.useOptimizerSwitch
                    }
                }
            })
        } catch (e) {
            throw new UnknownError(
                `Unexpected error accrued during mariadb config creation\n\n${e}`
            )
        }
    }
})

module.exports = createMariaDBConfig
