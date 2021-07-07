/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
const { getBaseConfig } = require('../../config');
const getDockerConfig = require('../../config/docker');
const { execAsyncSpawn } = require('../../util/exec-async-command');
const { folderName, legacyFolderName } = require('../../util/prefix');
const { createVolume } = require('./volumes');

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const convertLegacyVolumes = {
    task: async (ctx, task) => {
        const { config: { overridenConfiguration } } = ctx;
        const newDockerConfig = await getDockerConfig(overridenConfiguration, getBaseConfig(process.cwd(), folderName));

        const newVolumeNames = Object.values(newDockerConfig.volumes).filter((v) => !v.opts).map(({ name }) => name);

        const existingVolumes = (await execAsyncSpawn('docker volume ls -q')).split('\n');

        if (newVolumeNames.every((v) => existingVolumes.includes(v))) {
            return;
        }

        const legacyDockerConfig = await getDockerConfig(overridenConfiguration, getBaseConfig(process.cwd(), legacyFolderName));
        const legacyVolumeNames = Object.values(legacyDockerConfig.volumes).filter((v) => !v.opts).map(({ name }) => name);

        if (
            newVolumeNames.every((name) => !existingVolumes.includes(name))
            && legacyVolumeNames.every((name) => existingVolumes.includes(name))
        ) {
            task.title = 'Converting old volumes to new ones, this will take some time...';

            for (const [volumeName, volumeConfig] of Object.entries(newDockerConfig.volumes)) {
                const legacyVolumeConfig = legacyDockerConfig.volumes[volumeName];

                task.output = `Creating volume ${volumeConfig.name}...`;
                await createVolume(volumeConfig);
                task.output = `Copying data from ${legacyVolumeConfig.name} to ${volumeConfig.name}...`;
                await execAsyncSpawn(
                    `docker run --rm -v ${legacyVolumeConfig.name}:/from:ro -v ${volumeConfig.name}:/to alpine ash -c "cd /from; cp -av . /to"`, {
                        callback: (t) => {
                            task.output = t;
                        }
                    }
                );
            }

            const doDelete = await task.prompt({
                type: 'Toggle',
                message: `Good news! We successfully moved your data from legacy volumes ${legacyVolumeNames.join(', ')} to new ones!
But we have one last thing to do.
To free some space and avoid possible interference between docker volumes we strongly recommend you to delete legacy volumes ${legacyVolumeNames.join(', ')} now or when you are ready.
`,
                disabled: 'Delete later myself',
                enabled: 'Delete automatically now'
            });

            if (doDelete) {
                await execAsyncSpawn(
                    `docker volume rm ${legacyVolumeNames.join(' ')}`
                );
            }
        }
    }
};

module.exports = convertLegacyVolumes;
