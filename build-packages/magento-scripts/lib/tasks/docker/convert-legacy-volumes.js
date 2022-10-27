/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
const { stopServices } = require('./index')
const { getBaseConfig, getConfigFromMagentoVersion } = require('../../config')
const getDockerConfig = require('../../config/docker')
const { execAsyncSpawn } = require('../../util/exec-async-command')
const { folderName, legacyFolderName } = require('../../util/prefix')
const { volumeApi } = require('./volume')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const convertLegacyVolumes = () => ({
    task: async (ctx, task) => {
        const {
            config: { overridenConfiguration }
        } = ctx
        const newDockerConfig = await getDockerConfig(
            ctx,
            overridenConfiguration,
            getBaseConfig(process.cwd(), folderName)
        )

        const newVolumeNames = Object.values(newDockerConfig.volumes)
            .filter((v) => !v.opt)
            .map(({ name }) => name)

        const existingVolumes = await volumeApi.ls({ formatToJSON: true })

        if (newVolumeNames.every((v) => existingVolumes.includes(v))) {
            return
        }

        const legacyDockerConfig = await getDockerConfig(
            ctx,
            overridenConfiguration,
            getBaseConfig(process.cwd(), legacyFolderName)
        )
        const legacyVolumeNames = Object.values(legacyDockerConfig.volumes)
            .filter((v) => !v.opt)
            .map(({ name }) => name)

        if (
            newVolumeNames.every(
                (name) => !existingVolumes.some((v) => v.Name === name)
            ) &&
            legacyVolumeNames.every((name) =>
                existingVolumes.some((v) => v.Name === name)
            )
        ) {
            ctx.config = await getConfigFromMagentoVersion(ctx, {
                magentoVersion: ctx.magentoVersion,
                projectPath: process.cwd(),
                prefix: legacyFolderName
            })

            return task.newListr(
                [
                    stopServices(),
                    {
                        title: 'Migrating data from legacy volumes to new ones',
                        task: async (subCtx, subTask) => {
                            task.title =
                                'Converting old volumes to new ones, this will take some time...'

                            for (const [
                                volumeName,
                                volumeConfig
                            ] of Object.entries(newDockerConfig.volumes)) {
                                const legacyVolumeConfig =
                                    legacyDockerConfig.volumes[volumeName]

                                subTask.output = `Creating volume ${volumeConfig.name}...`
                                await volumeApi.create(volumeConfig)
                                subTask.output = `Copying data from ${legacyVolumeConfig.name} to ${volumeConfig.name}...`
                                await execAsyncSpawn(
                                    `docker run --rm -v ${legacyVolumeConfig.name}:/from:ro -v ${volumeConfig.name}:/to alpine ash -c "cd /from; cp -av . /to"`,
                                    {
                                        callback: (t) => {
                                            task.output = t
                                        }
                                    }
                                )
                            }

                            subCtx.config = await getConfigFromMagentoVersion(
                                ctx.magentoVersion,
                                process.cwd()
                            )

                            const doDelete = await subTask.prompt({
                                type: 'Toggle',
                                message: `Good news! We successfully moved your data from legacy volumes ${legacyVolumeNames.join(
                                    ', '
                                )} to new ones!
            But we have one last thing to do.
            To free some space and avoid possible interference between docker volumes we strongly recommend you to delete legacy volumes ${legacyVolumeNames.join(
                ', '
            )} now or when you are ready.
            `,
                                disabled: 'Delete later myself',
                                enabled: 'Delete automatically now'
                            })

                            if (doDelete) {
                                await execAsyncSpawn(
                                    `docker volume rm ${legacyVolumeNames.join(
                                        ' '
                                    )}`
                                )
                            }
                        },
                        options: {
                            bottomBar: 10
                        }
                    }
                ],
                {
                    concurrent: false
                }
            )
        }
    }
})

module.exports = convertLegacyVolumes
