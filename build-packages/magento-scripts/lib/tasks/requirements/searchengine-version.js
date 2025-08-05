const { request } = require('smol-request')
const UnknownError = require('../../errors/unknown-error')
const waitForLogs = require('../../util/wait-for-logs')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const checkSearchEngineVersion = () => ({
    title: 'Retrieving search engine version',
    task: async (ctx, task) => {
        const {
            ports,
            config: {
                overridenConfiguration: {
                    configuration: { searchengine }
                }
            }
        } = ctx

        const { elasticsearch } = ctx.config.docker.getContainers(ports)

        await waitForLogs({
            containerName: elasticsearch.name,
            matchText:
                searchengine === 'elasticsearch' ? '"started"' : '] started'
        })

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

            const searchEngineVersion = response.data.version.number
            if (searchengine === 'elasticsearch') {
                ctx.elasticSearchVersion = searchEngineVersion
            } else {
                ctx.openSearchVersion = searchEngineVersion
            }
        } catch (e) {
            if (searchengine === 'opensearch') {
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
