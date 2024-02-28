const UnknownError = require('../../errors/unknown-error')
const { containerApi } = require('../docker/containers')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const checkOpenSearchVersion = () => ({
    title: 'Checking container OpenSearch version',
    task: async (ctx, task) => {
        const { opensearch, elasticsearch } =
            ctx.config.overridenConfiguration.configuration
        const { ports } = ctx

        let openSearchVersionResponse

        try {
            openSearchVersionResponse = await containerApi.run({
                ...elasticsearch,
                command: 'opensearch --version',
                detach: false,
                rm: true,
                ports: [`127.0.0.1:${ports.opensearch}:9200`],
                memory: '512mb'
            })
        } catch (e) {
            openSearchVersionResponse = e.message
        }

        const openSearchVersionResponseResult =
            openSearchVersionResponse.match(/Version:\s(\d+\.\d+\.\d+)/i)

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
