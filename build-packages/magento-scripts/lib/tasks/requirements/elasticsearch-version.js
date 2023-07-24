const UnknownError = require('../../errors/unknown-error')
const logger = require('@scandipwa/scandipwa-dev-utils/logger')
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

        let elasticSearchVersionResponse

        try {
            elasticSearchVersionResponse = await containerApi.run({
                ...elasticsearch,
                command: 'elasticsearch --version',
                detach: false,
                rm: true,
                ports: [`127.0.0.1:${ports.elasticsearch}:9200`],
                memory: '512mb'
            })
        } catch (e) {
            elasticSearchVersionResponse = e.message
        }

        // if (elasticSearchVersionResponse === '') {
        //     const tryDisablingSwappingForES = await task.prompt({
        //         type: 'Select',
        //         message: `It looks like ElasticSearch wasn't able to start properly, do you want to try disabling swapping and running it again?

        //         (Note that if it works, you should edit cma.js and add this to ${logger.style.code(
        //             'configuration.elasticsearch.env'
        //         )} as { 'bootstrap.mlockall': false })`,
        //         choices: [
        //             {
        //                 name: 'yes',
        //                 message: `Try disabling swapping and run ElasticSearch`
        //             },
        //             {
        //                 name: 'no',
        //                 message: "Skip, I don't care"
        //             }
        //         ]
        //     })

        //     if (tryDisablingSwappingForES === 'yes') {
        //         try {
        //             elasticSearchVersionResponse = await containerApi.run({
        //                 ...elasticsearch,
        //                 env: {
        //                     ...elasticsearch.env,
        //                     'bootstrap.mlockall': false
        //                 },
        //                 command: 'elasticsearch --version',
        //                 detach: false,
        //                 rm: true,
        //                 ports: [`127.0.0.1:${ports.elasticsearch}:9200`],
        //                 memory: '512mb'
        //             })
        //         } catch (e) {
        //             elasticSearchVersionResponse = e.message
        //         }
        //     }
        // }

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
