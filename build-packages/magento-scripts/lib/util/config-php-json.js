const path = require('path')
const UnknownError = require('../errors/unknown-error')
const { runPHPContainerCommand } = require('../tasks/php/php-container')
const pathExists = require('./path-exists')

/**
 * @param {import('../../typings/context').ListrContext} ctx
 *
 * @returns {Promise<import('../../typings/common').ConfigPHPType | null>}
 */
const configPhpToJson = async (ctx) => {
    const configPhpOnSystemPath = path.join(
        ctx.config.baseConfig.magentoDir,
        'app',
        'etc',
        'config.php'
    )
    const configPhpInContainerPath = path.join(
        ctx.config.baseConfig.containerMagentoDir,
        'app',
        'etc',
        'config.php'
    )
    if (!(await pathExists(configPhpOnSystemPath))) {
        return null
    }
    const { code, result } = await runPHPContainerCommand(
        ctx,
        `php -r "echo json_encode(require '${configPhpInContainerPath}');"`,
        {
            withCode: true
        }
    )

    if (code !== 0) {
        throw new UnknownError(
            `Received non-zero code during converting app/etc/config.php to json:\n\n${result}`
        )
    }
    try {
        return JSON.parse(result)
    } catch (e) {
        throw new UnknownError(
            `Ooops! Something went wrong when trying to parse app/etc/config.php file!\n\n${e}\n\nFile result: ${result}`
        )
    }
}

module.exports = configPhpToJson
