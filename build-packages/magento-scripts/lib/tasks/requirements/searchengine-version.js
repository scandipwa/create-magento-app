const { request } = require('smol-request')
const UnknownError = require('../../errors/unknown-error')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const checkSearchEngineVersion = () => ({
    // title: 'Checking container SearchEngine version',
    task: async (ctx, task) => {
        const { ports } = ctx

        try {
            const response = await request(
                `http://localhost:${ports.elasticsearch}/`,
                {
                    method: 'GET',
                    responseType: 'json'
                }
            )

            if (response.status !== 200) {
                if (
                    ctx.config.overridenConfiguration.configuration
                        .searchengine === 'opensearch'
                ) {
                    throw new UnknownError(
                        `OpenSearch container is not running!\n\nStatus code: ${response.status}, Response: ${response.data.message}`
                    )
                } else {
                    throw new UnknownError(
                        `ElasticSearch container is not running!\n\nStatus code: ${response.status}, Response: ${response.data.message}`
                    )
                }
            }

            const openSearchVersion = response.data.version.number
            ctx.openSearchVersion = openSearchVersion
        } catch (e) {
            if (
                ctx.config.overridenConfiguration.configuration.searchengine ===
                'opensearch'
            ) {
                throw new UnknownError(
                    `Cannot connect to OpenSearch container!\n\n${e.message}`
                )
            } else {
                throw new UnknownError(
                    `Cannot connect to ElasticSearch container!\n\n${e.message}`
                )
            }
        }
    }
})

module.exports = checkSearchEngineVersion
