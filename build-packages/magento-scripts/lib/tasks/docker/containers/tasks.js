/* eslint-disable max-len */
const sleep = require('../../../util/sleep')
const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const KnownError = require('../../../errors/known-error')
const containerApi = require('./container-api')
const { imageApi } = require('../image')
const { execAsyncSpawn } = require('../../../util/exec-async-command')
const waitForLogs = require('../../../util/wait-for-logs')

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
 * @param {{ pullImage?: boolean }} param0
 */
const filterNonPullableImages = ({ pullImage }) => {
    if (typeof pullImage === 'boolean' && !pullImage) {
        return false
    }

    return true
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
                    .filter(filterNonPullableImages)
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
            .filter(filterNonPullableImages)
            .reduce(remoteImageReducer, [])
            .map((image) => `reference='${image}'`)

        const existingImages = await imageApi.ls({
            formatToJSON: true,
            filter: imagesFilter
        })

        const missingContainerImages = containers
            .filter(filterNonPullableImages)
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
    task: async ({ ports, config: { docker } }, task) => {
        const containerList = await containerApi.ls({
            formatToJSON: true,
            all: true
        })

        const containers = docker.getContainers(ports)

        const missingContainers = Object.entries(containers)
            .filter(
                ([nameWithoutPrefix, { name }]) =>
                    !containerList.some((c) => c.Names === name)
            )
            .map(([nameWithoutPrefix, containerOptions]) => ({
                ...containerOptions,
                nameWithoutPrefix
            }))

        if (missingContainers.length === 0) {
            task.skip()
            return
        }

        const containerStatuses = missingContainers.reduce(
            (acc, container) => ({
                ...acc,
                [container.nameWithoutPrefix]: {
                    started: false,
                    onStarted: []
                }
            }),
            {}
        )

        return task.newListr(
            missingContainers.map((container) => ({
                title: `Deploying ${logger.style.file(container._)} container`,
                task: async (subCtx, subTask) => {
                    const { dependsOn } = container
                    if (Array.isArray(dependsOn)) {
                        const startedContainers = []
                        subTask.title = `Container ${
                            container._
                        } is waiting for ${dependsOn
                            .map((a) => containers[a]._)
                            .join(', ')} to start...`
                        await Promise.all(
                            dependsOn.map(
                                async (name) =>
                                    new Promise((resolve, reject) => {
                                        const timeout = setTimeout(
                                            () => {
                                                reject(
                                                    new Error(
                                                        `Container ${name} not started in time`
                                                    )
                                                )
                                            },
                                            // 2 minutes
                                            1000 * 60 * 2
                                        )
                                        containerStatuses[name].onStarted.push(
                                            () => {
                                                startedContainers.push(name)
                                                subTask.title = `Container ${
                                                    container._
                                                } is waiting for ${dependsOn
                                                    .filter(
                                                        (d) =>
                                                            !startedContainers.includes(
                                                                d
                                                            )
                                                    )
                                                    .map((d) => containers[d]._)
                                                    .join(', ')} to start...`
                                                clearTimeout(timeout)
                                                resolve()
                                            }
                                        )
                                    })
                            )
                        )
                    }

                    subTask.title = `${container._} is starting...`

                    await containerApi.run(container)

                    if (container.serviceReadyLog) {
                        await waitForLogs({
                            containerName: container.name,
                            matchText: container.serviceReadyLog
                        })
                    }

                    containerStatuses[
                        container.nameWithoutPrefix
                    ].started = true
                    containerStatuses[
                        container.nameWithoutPrefix
                    ].onStarted.forEach((cb) => {
                        cb()
                    })

                    subTask.title = `${container._} container started`
                }
            })),
            {
                concurrent: true,
                exitOnError: true
            }
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
