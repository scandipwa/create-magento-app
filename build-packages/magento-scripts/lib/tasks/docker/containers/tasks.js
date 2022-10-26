/* eslint-disable max-len */
const sleep = require('../../../util/sleep')
const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const KnownError = require('../../../errors/known-error')
const containerApi = require('./container-api')
const { imageApi } = require('../image')
const { execAsyncSpawn } = require('../../../util/exec-async-command')

/**
 * @param {string[]} containers
 */
const stopAndRemoveContainers = async (containers) => {
    await containerApi.stop(containers)
    await containerApi.rm(containers)
}

/**
 * @param {string} image
 */
const pull = async (image) => execAsyncSpawn(`docker pull ${image}`)

/**
 * @param {string[]} acc
 * @param {{ remoteImages?: string[], image: string }} val
 */
const remoteImageReducer = (acc, val) => {
    if (
        Array.isArray(val.remoteImages) &&
        val.remoteImages.every((image) => typeof image === 'string')
    ) {
        return acc.concat(val.remoteImages)
    }

    return acc.concat([val.image])
}

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const pullImages = () => ({
    title: 'Pulling container images',
    task: async ({ config: { docker }, pullImages }, task) => {
        const containers = Object.values(docker.getContainers())

        if (pullImages) {
            return task.newListr(
                containers
                    .reduce(remoteImageReducer, [])
                    .map((image) => {
                        const [repo, tag = 'latest'] = image.split(':')

                        return { repo, tag }
                    })
                    .reduce(
                        (acc, val) =>
                            acc.concat(
                                acc.some(
                                    (c) =>
                                        c.repo === val.repo && c.tag === val.tag
                                )
                                    ? []
                                    : val
                            ),
                        []
                    )
                    .map(({ repo, tag }) => ({
                        title: `Pulling ${logger.style.file(
                            `${repo}:${tag}`
                        )} image`,
                        task: () => pull(`${repo}:${tag}`)
                    })),
                {
                    concurrent: true,
                    exitOnError: true
                }
            )
        }

        const imagesFilter = containers
            .reduce(remoteImageReducer, [])
            .map((image) => `reference='${image}'`)

        const existingImages = await imageApi.ls({
            formatToJSON: true,
            filter: imagesFilter
        })

        const missingContainerImages = containers
            .reduce(remoteImageReducer, [])
            .map((image) => {
                const [repo, tag = 'latest'] = image.split(':')

                return { repo, tag }
            })
            .filter(
                ({ repo, tag }) =>
                    !existingImages.some(
                        (image) =>
                            image.Repository === repo && image.Tag === tag
                    )
            )
            .reduce(
                (acc, val) =>
                    acc.concat(
                        acc.some(
                            (c) => c.repo === val.repo && c.tag === val.tag
                        )
                            ? []
                            : val
                    ),
                []
            )

        if (missingContainerImages.length === 0) {
            task.skip()
            return
        }

        return task.newListr(
            missingContainerImages.map(({ repo, tag }) => ({
                title: `Pulling ${logger.style.file(`${repo}:${tag}`)} image`,
                task: () => pull(`${repo}:${tag}`)
            })),
            {
                concurrent: true,
                exitOnError: true
            }
        )
    }
})

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const startContainers = () => ({
    title: 'Starting containers',
    task: async ({ ports, config: { docker }, debug }, task) => {
        const containerList = await containerApi.ls({
            formatToJSON: true,
            all: true
        })

        const missingContainers = Object.values(
            docker.getContainers(ports)
        ).filter(({ name }) => !containerList.some((c) => c.Names === name))

        if (missingContainers.length === 0) {
            task.skip()
            return
        }

        if (debug) {
            await Promise.all(
                missingContainers
                    .map((container) => {
                        if (container.debugImage) {
                            container.image = container.debugImage
                        }

                        return container
                    })
                    .map((container) =>
                        containerApi.run(container).then((out) => {
                            task.output = `From ${container._}: ${out}`
                        })
                    )
            )

            return
        }

        // TODO: we might stop containers here ?
        await Promise.all(
            missingContainers.map((container) =>
                containerApi.run(container).then((out) => {
                    task.output = `From ${container._}: ${out}`
                })
            )
        )
    },
    options: {
        bottomBar: 10
    }
})

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const stopContainers = () => ({
    title: 'Stopping Docker containers',
    task: async (
        {
            config: {
                baseConfig: { prefix }
            }
        },
        task
    ) => {
        const containerList = await containerApi.ls({
            formatToJSON: true,
            all: true
        })

        const runningContainers = containerList.filter((containerName) =>
            containerName.Names.startsWith(prefix)
        )

        if (runningContainers.length === 0) {
            task.skip()
            return
        }

        await stopAndRemoveContainers(
            runningContainers.map(({ Names }) => Names)
        )
    }
})

/**
 * @param {string} containerName
 */
const getContainerStatus = async (containerName) => {
    try {
        return JSON.parse(
            await execAsyncSpawn(
                `docker inspect --format='{{json .}}' ${containerName}`
            )
        )
    } catch {
        return null
    }
}

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const checkContainersAreRunning = () => ({
    title: 'Checking container statuses',
    task: async (ctx, task) => {
        const {
            config: { docker },
            ports
        } = ctx
        const containers = Object.values(docker.getContainers(ports))
        let tries = 0
        while (tries < 3) {
            const containersWithStatus = await Promise.all(
                containers.map(async (container) => ({
                    ...container,
                    status: await getContainerStatus(container.name)
                }))
            )

            if (
                containersWithStatus.some(
                    (c) => c.status.State.Status !== 'running'
                )
            ) {
                if (tries === 2) {
                    throw new KnownError(
                        `${containersWithStatus
                            .filter((c) => c.status.State.Status !== 'running')
                            .map((c) => c._)
                            .join(
                                ', '
                            )} containers are not running! Please check container logs for more details!`
                    )
                } else {
                    task.output = `${containersWithStatus
                        .filter((c) => c.status.State.Status !== 'running')
                        .map((c) => c._)
                        .join(
                            ', '
                        )} are not running, waiting if something will change...`
                    await sleep(2000)
                    tries++
                }
            } else {
                break
            }
        }
    },
    options: {
        bottomBar: 10
    }
})

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const statusContainers = () => ({
    task: async (ctx) => {
        const {
            config: { docker },
            ports
        } = ctx
        const containers = Object.values(docker.getContainers(ports))

        ctx.containers = await Promise.all(
            containers.map(async (container) => ({
                ...container,
                status: await getContainerStatus(container.name)
            }))
        )
    },
    options: {
        bottomBar: 10
    }
})

module.exports = {
    startContainers,
    stopContainers,
    pullImages,
    statusContainers,
    checkContainersAreRunning,
    getContainerStatus
}
