const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const KnownError = require('../../../errors/known-error')
const UnknownError = require('../../../errors/unknown-error')
const { execAsyncSpawn } = require('../../../util/exec-async-command')
const networkApi = require('./network-api')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const pruneNetworks = () => ({
    title: 'Removing custom networks not used by at least one container',
    task: () => execAsyncSpawn('docker network prune -f')
})

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const createNetwork = () => ({
    title: 'Deploying Docker network',
    task: async ({ config: { docker } }, task) => {
        const networkList = await networkApi.ls({ formatToJSON: true })

        if (
            networkList.some((network) => network.Name === docker.network.name)
        ) {
            task.skip()
            return
        }
        try {
            await networkApi.create({
                network: docker.network.name,
                driver: 'bridge'
            })
        } catch (e) {
            if (
                e.message.includes(
                    'could not find an available, non-overlapping IPv4 address pool'
                )
            ) {
                const doPruneNetworks = await task.prompt({
                    type: 'Confirm',
                    message: `You don't have available, non-overlapping IPv4 address pool on you system.
Do you want remove all custom networks not used by at least one container?`
                })

                if (doPruneNetworks) {
                    return task.newListr([
                        pruneNetworks(),
                        {
                            task: () =>
                                networkApi.create({
                                    network: docker.network.name,
                                    driver: 'bridge'
                                })
                        }
                    ])
                }

                throw new KnownError(`Unable to create network for your project.
You need to delete unused networks yourself.
Use command ${logger.style.command('docker network prune')}`)
            }

            throw new UnknownError(`Unable to create network!\n\n${e}`)
        }
    }
})

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const removeNetwork = () => ({
    title: 'Removing Docker network',
    task: async ({ config: { docker } }, task) => {
        const networkList = await networkApi.ls({ formatToJSON: true })

        if (
            !networkList.some((network) => network.Name === docker.network.name)
        ) {
            task.skip()
            return
        }

        await execAsyncSpawn(`docker network rm ${docker.network.name}`)
    }
})

module.exports = {
    createNetwork,
    removeNetwork,
    pruneNetworks
}
