const UnknownError = require('../../errors/unknown-error')
const { runContainerImage } = require('../../util/run-container-image')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const checkPHPVersion = () => ({
    title: 'Checking container PHP version',
    task: async (ctx, task) => {
        const phpVersionResponse = await runContainerImage(
            ctx.config.overridenConfiguration.configuration.php.baseImage,
            'php --version'
        )

        const phpVersionResponseResult =
            phpVersionResponse.match(/PHP\s(\d+\.\d+\.\d+)/i)

        if (phpVersionResponseResult && phpVersionResponseResult.length > 0) {
            const phpVersion = phpVersionResponseResult[1]

            ctx.phpVersion = phpVersion
            task.title = `Using PHP version ${phpVersion} in container`
        } else {
            throw new UnknownError(
                `Cannot retrieve PHP Version!\n\n${phpVersionResponse}`
            )
        }
    }
})

module.exports = checkPHPVersion
