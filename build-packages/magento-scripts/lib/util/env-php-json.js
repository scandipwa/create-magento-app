const path = require('path')
const UnknownError = require('../errors/unknown-error')
const { runPHPContainerCommand } = require('../tasks/php/php-container')
const pathExists = require('./path-exists')

/**
 * @typedef EnvPHPData
 *
 * @prop {Record<string, number>} cache_types
 * @prop {{ key: string }} crypt
 */

/**
 * @param {import('../../typings/context').ListrContext} ctx
 * @returns {Promise<EnvPHPData | null>}
 */
const envPhpToJson = async (ctx) => {
    const envPhpOnSystemPath = path.join(
        ctx.config.baseConfig.magentoDir,
        'app',
        'etc',
        'env.php'
    )
    const envPhpInContainerPath = path.join(
        ctx.config.baseConfig.containerMagentoDir,
        'app',
        'etc',
        'env.php'
    )
    if (!(await pathExists(envPhpOnSystemPath))) {
        return null
    }
    const { code, result } = await runPHPContainerCommand(
        ctx,
        `php -r "echo json_encode(require '${envPhpInContainerPath}');"`,
        {
            withCode: true
        }
    )

    if (code !== 0) {
        throw new UnknownError(
            `Received non-zero code during converting app/etc/env.php to json:\n\n${result}`
        )
    }
    try {
        return JSON.parse(result)
    } catch (e) {
        throw new UnknownError(
            `Ooops! Something went wrong when trying to parse app/etc/env.php file!\n\n${e}\n\nFile result: ${result}`
        )
    }
}

module.exports = envPhpToJson
