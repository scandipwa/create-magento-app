const { getPort } = require('../../config/port-config')
const UnknownError = require('../../errors/unknown-error')
const { containerApi } = require('../docker/containers')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const checkOpenSearchVersion = () => ({
    title: 'Checking container OpenSearch version',
    task: async (ctx, task) => {
        const { opensearch } = ctx.config.overridenConfiguration.configuration
        const { ports } = ctx

        const { elasticsearch: openSearchContainer } =
            ctx.config.docker.getContainers(ports)

        let openSearchVersionResponse

        const openSearchContainerRunning = await containerApi.ls({
            filter: `name=${openSearchContainer.name}`,
            formatToJSON: true
        })

        if (
            openSearchContainerRunning.length !== 0 &&
            openSearchContainerRunning[0].State === 'running'
        ) {
            openSearchVersionResponse = await containerApi.exec(
                'opensearch --version',
                openSearchContainer.name
            )
        } else {
            try {
                const availableOpenSearchPort = await getPort(
                    ports.elasticsearch
                )
                openSearchVersionResponse = await containerApi.run({
                    ...opensearch,
                    command: 'opensearch --version',
                    detach: false,
                    rm: true,
                    ports: [`127.0.0.1:${availableOpenSearchPort}:9200`],
                    memory: '512mb'
                })
            } catch (e) {
                openSearchVersionResponse = e.message
            }
        }

        const openSearchVersionResponseResult = openSearchVersionResponse.match(
            /Version:\s(\d+\.\d+\.\d+)/i
        )

        if (
            openSearchVersionResponseResult &&
            openSearchVersionResponseResult.length > 0
        ) {
            const openSearchVersion = openSearchVersionResponseResult[1]

            ctx.openSearchVersion = openSearchVersion
            task.title = `Using OpenSearch version ${openSearchVersion} in container`
        } else {
            throw new UnknownError(
                `Cannot retrieve OpenSearch Version!\n\n${openSearchVersionResponse}`
            )
        }
    },
    exitOnError: false
})

module.exports = checkOpenSearchVersion
