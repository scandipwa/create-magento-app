const { getPort } = require('../../config/port-config')
const UnknownError = require('../../errors/unknown-error')
const { containerApi } = require('../docker/containers')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const checkElasticSearchVersion = () => ({
    title: 'Checking container ElasticSearch version',
    task: async (ctx, task) => {
        const { elasticsearch } =
            ctx.config.overridenConfiguration.configuration
        const { ports } = ctx

        const { elasticsearch: elasticSearchContainer } =
            ctx.config.docker.getContainers(ports)

        let elasticSearchVersionResponse

        const elasticSearchContainerRunning = await containerApi.ls({
            filter: `name=${elasticSearchContainer.name}`,
            formatToJSON: true
        })

        if (
            elasticSearchContainerRunning.length !== 0 &&
            elasticSearchContainerRunning[0].State === 'running'
        ) {
            elasticSearchVersionResponse = await containerApi.exec({
                command: 'elasticsearch --version',
                container: elasticSearchContainer.name
            })
        } else {
            try {
                const availableElasticSearchPort = await getPort(
                    ports.elasticsearch
                )
                elasticSearchVersionResponse = await containerApi.run({
                    ...elasticsearch,
                    command: 'elasticsearch --version',
                    detach: false,
                    rm: true,
                    ports: [`127.0.0.1:${availableElasticSearchPort}:9200`],
                    memory: '2gb'
                })
            } catch (e) {
                elasticSearchVersionResponse = e.message
            }
        }

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
    },
    exitOnError: false
})

module.exports = checkElasticSearchVersion
