const UnknownError = require('../../errors/unknown-error')
const { runContainerImage } = require('../../util/run-container-image')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const checkElasticSearchVersion = () => ({
    title: 'Checking container ElasticSearch version',
    task: async (ctx, task) => {
        const elasticSearchVersionResponse = await runContainerImage(
            ctx.config.overridenConfiguration.configuration.elasticsearch.image,
            'elasticsearch --version'
        )

        const elasticSearchVersionResponseResult =
            elasticSearchVersionResponse.match(/Version:\s(\d+\.\d+\.\d+)/i)

        if (
            elasticSearchVersionResponseResult &&
            elasticSearchVersionResponseResult.length > 0
        ) {
            const elasticSearchVersion = elasticSearchVersionResponseResult[1]

            ctx.elasticSearchVersion = elasticSearchVersion
            task.title = `Using ElasticSearch version ${elasticSearchVersion} in container`
        } else {
            throw new UnknownError(
                `Cannot retrieve ElasticSearch Version!\n\n${elasticSearchVersionResponse}`
            )
        }
    }
})

module.exports = checkElasticSearchVersion
