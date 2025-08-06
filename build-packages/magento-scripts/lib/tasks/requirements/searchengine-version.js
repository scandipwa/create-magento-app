const { request } = require('smol-request')
const UnknownError = require('../../errors/unknown-error')
const waitForLogs = require('../../util/wait-for-logs')
const { containerApi } = require('../docker/containers')
const { getPort } = require('../../config/port-config')
const { createNetwork } = require('../docker/network/tasks')

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

        // check if container is running
        // if not running, start temporary container to extract version
        const containers = await containerApi.ls({
            filter: `name=${elasticsearch.name}`,
            formatToJSON: true
        })
        if (containers.length === 0) {
            return task.newListr(
                [
                    createNetwork(),
                    {
                        title: 'Starting temporary container',
                        task: async (subCtx, subTask) => {
                            try {
                                const availablePort = await getPort(
                                    ports.elasticsearch
                                )
                                const searchEngineVersionResponse =
                                    await containerApi.run({
                                        ...elasticsearch,
                                        command:
                                            searchengine === 'elasticsearch'
                                                ? 'elasticsearch --version'
                                                : 'opensearch --version',
                                        detach: false,
                                        rm: true,
                                        ports: [
                                            `127.0.0.1:${availablePort}:9200`
                                        ],
                                        memory: '2gb'
                                    })
                                const searchEngineVersionResponseResult =
                                    searchEngineVersionResponse.match(
                                        /Version:\s(\d+\.\d+\.\d+)/i
                                    )

                                if (
                                    searchEngineVersionResponseResult &&
                                    searchEngineVersionResponseResult.length > 0
                                ) {
                                    const searchEngineVersion =
                                        searchEngineVersionResponseResult[1]

                                    if (searchengine === 'elasticsearch') {
                                        ctx.elasticSearchVersion =
                                            searchEngineVersion
                                    } else {
                                        ctx.openSearchVersion =
                                            searchEngineVersion
                                    }

                                    task.title = `Using ${
                                        searchengine === 'elasticsearch'
                                            ? 'ElasticSearch'
                                            : 'OpenSearch'
                                    } version ${searchEngineVersion} in container`
                                }
                            } catch (e) {
                                subTask.skip()
                            }
                        }
                    }
                ],
                {
                    rendererOptions: {
                        collapse: true
                    }
                }
            )
        } else {
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
                    if (searchengine === 'opensearch') {
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
    }
})

module.exports = checkSearchEngineVersion
