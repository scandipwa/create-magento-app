/* eslint-disable camelcase */
const { containerApi } = require('./containers')
const volumeApi = require('./volume/volume-api')

const composeHomeDataVolumeName = 'composer_home-data'

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const convertComposerHomeToComposerCacheVolume = () => ({
    skip: async () => {
        const volumeList = await volumeApi.ls({
            formatToJSON: true,
            filter: `name=${composeHomeDataVolumeName}`
        })

        return volumeList.length === 0
    },
    task: async (ctx, task) => {
        if (ctx.platform === 'linux' && !ctx.isDockerDesktop) {
            await volumeApi.rm({ volumes: [composeHomeDataVolumeName] })
            return
        }

        const { composer_cache } = ctx.config.docker.volumes
        task.title = `Migrating from ${composer_cache.name} volume to ${composeHomeDataVolumeName}...`
        await containerApi.run({
            rm: true,
            detach: false,
            mountVolumes: [
                `${composeHomeDataVolumeName}:/from:ro`,
                `${composer_cache.name}:/to`
            ],
            image: 'alpine',
            command: 'ash -c "cd /from/cache; cp -av . /to"'
        })

        const runningContainers = await volumeApi.inspect({
            volume: composeHomeDataVolumeName,
            formatToJSON: true
        })

        if (
            runningContainers.Containers &&
            Object.entries(runningContainers.Containers).length > 0
        ) {
            await Promise.all(
                Object.values(runningContainers.Containers).map(async (c) => {
                    await containerApi.stop([c.Name])
                    await containerApi.rm([c.Name])
                })
            )
        }

        await volumeApi.rm({ volumes: [composeHomeDataVolumeName] })
    }
})

module.exports = {
    convertComposerHomeToComposerCacheVolume
}
