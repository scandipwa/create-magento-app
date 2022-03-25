const { execAsyncSpawn } = require('../../util/exec-async-command');

const createVolume = ({
    driver,
    opts = {},
    name
}) => {
    let command = `docker volume create ${ Object.entries(opts).map(([name, value]) => `--opt ${name}=${value}`).join(' ') } `;

    if (driver) {
        command += `--driver ${ driver }`;
    }

    return execAsyncSpawn(`${ command } ${ name }`);
};

const getVolumeList = async () => (await execAsyncSpawn('docker volume ls --format "{{.Name}}"')).split('\n');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const createVolumes = () => ({
    title: 'Creating volumes',
    task: async ({ config: { docker } }, task) => {
        const volumeList = await getVolumeList();

        const missingVolumes = Object.values(docker.volumes).filter(
            ({ name }) => !volumeList.includes(name)
        );

        if (missingVolumes.length === 0) {
            task.skip();
            return;
        }

        await Promise.all(missingVolumes.map((volume) => createVolume(volume)));
    }
});

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const removeVolumes = () => ({
    title: 'Removing volumes',
    task: async ({ config: { docker } }, task) => {
        const volumeList = await getVolumeList();

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
    removeVolumes,
    createVolume
};
