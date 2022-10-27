const fs = require('fs')
const pathExists = require('../../../util/path-exists')
const { containerApi } = require('../containers')
const volumeApi = require('./volume-api')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const createVolumes = () => ({
    title: 'Creating volumes',
    task: async ({ config: { docker } }, task) => {
        const volumeList = await volumeApi.ls({
            formatToJSON: true
        })

        const missingVolumes = Object.values(docker.volumes).filter(
            ({ name }) => !volumeList.some((v) => v.Name === name)
        )

        if (missingVolumes.length === 0) {
            task.skip()
            return
        }

        await Promise.all(
            missingVolumes.map(async (volume) => {
                if (
                    volume.opt &&
                    volume.opt.device &&
                    !(await pathExists(volume.opt.device))
                ) {
                    await fs.promises.mkdir(volume.opt.device, {
                        recursive: true
                    })
                }
            })
        )

        await Promise.all(
            missingVolumes.map((volume) => volumeApi.create(volume))
        )
    }
})

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const removeVolumes = () => ({
    title: 'Removing volumes',
    task: async ({ config: { docker } }, task) => {
        const volumeList = await volumeApi.ls({
            formatToJSON: true
        })

        const deployedVolumes = Object.values(docker.volumes).filter(
            ({ name }) => volumeList.some((v) => v.Name === name)
        )

        if (deployedVolumes.length === 0) {
            task.skip()
            return
        }

        await volumeApi.rm({
            volumes: deployedVolumes.map(({ name }) => name)
        })
    }
})

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const removeLocalVolumes = () => ({
    title: 'Removing local volumes',
    task: async (ctx, task) => {
        const volumeList = await volumeApi.ls({
            formatToJSON: true
        })
        const { volumes } = ctx.config.docker

        const localVolumes = Object.values(volumes).filter(
            (volume) => volume.opt && volume.opt.device
        )

        const existingLocalVolumes = localVolumes.filter((volume) =>
            volumeList.some((v) => v.Name === volume.name)
        )

        if (existingLocalVolumes.length > 0) {
            const existingLocalVolumesDetails = await Promise.all(
                existingLocalVolumes.map((v) =>
                    volumeApi.inspect({ volume: v.name, formatToJSON: true })
                )
            )

            await Promise.all(
                existingLocalVolumesDetails.map(async (v) => {
                    if (
                        v.Containers &&
                        Object.entries(v.Containers).length > 0
                    ) {
                        await Promise.all(
                            Object.values(v.Containers).map(async (c) => {
                                await containerApi.stop([c.Name])
                                await containerApi.rm([c.Name])
                            })
                        )
                    }
                })
            )
            await volumeApi.rm({
                volumes: existingLocalVolumes.map((volume) => volume.name)
            })
        } else {
            task.skip()
        }
    }
})

module.exports = {
    createVolumes,
    removeVolumes,
    removeLocalVolumes
}
