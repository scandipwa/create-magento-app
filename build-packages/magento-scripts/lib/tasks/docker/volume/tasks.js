const fs = require('fs');
const { execAsyncSpawn } = require('../../../util/exec-async-command');
const pathExists = require('../../../util/path-exists');
const { create } = require('./volume-api');

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const createVolumes = () => ({
    title: 'Creating volumes',
    task: async ({ config: { docker } }, task) => {
        const volumeList = (await execAsyncSpawn('docker volume ls --format "{{.Name}}"')).split('\n');

        const missingVolumes = Object.values(docker.volumes).filter(
            ({ name }) => !volumeList.includes(name)
        );

        if (missingVolumes.length === 0) {
            task.skip();
            return;
        }

        await Promise.all(missingVolumes.map(async (volume) => {
            if (volume.opt && volume.opt.device && !await pathExists(volume.opt.device)) {
                await fs.promises.mkdir(volume.opt.device, {
                    recursive: true
                });
            }
        }));

        await Promise.all(missingVolumes.map((volume) => create(volume)));
    }
});

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const removeVolumes = () => ({
    title: 'Removing volumes',
    task: async ({ config: { docker } }, task) => {
        const volumeList = (await execAsyncSpawn('docker volume ls --format "{{.Name}}"')).split('\n');

        const deployedVolumes = Object.values(docker.volumes).filter(
            ({ name }) => volumeList.includes(name)
        );

        if (deployedVolumes.length === 0) {
            task.skip();
            return;
        }

        await execAsyncSpawn(`docker volume rm ${deployedVolumes.map(({ name }) => name).join(' ')}`);
    }
});

module.exports = {
    createVolumes,
    removeVolumes
};
