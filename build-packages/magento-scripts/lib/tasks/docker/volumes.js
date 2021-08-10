const { execAsyncSpawn } = require('../../util/exec-async-command');

const create = ({
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

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const createVolumes = () => ({
    title: 'Creating volumes',
    task: async ({ config: { docker } }, task) => {
        const volumeList = (await execAsyncSpawn('docker volume ls -q')).split('\n');

        const missingVolumes = Object.values(docker.volumes).filter(
            ({ name }) => !volumeList.some((volume) => volume === name)
        );

        if (missingVolumes.length === 0) {
            task.skip();
            return;
        }

        await Promise.all(missingVolumes.map((volume) => create(volume)));
    }
});

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const removeVolumes = () => ({
    title: 'Removing volumes',
    task: async ({ config: { docker } }, task) => {
        const volumeList = (await execAsyncSpawn('docker volume ls -q')).split('\n');

        const deployedVolumes = Object.values(docker.volumes).filter(
            ({ name }) => volumeList.some((volume) => volume === name)
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
    createVolume: create
};
