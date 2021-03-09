/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */
const { execAsyncSpawn } = require('../../util/exec-async-command');

const run = (options) => {
    const {
        expose = [],
        ports = [],
        mounts = [],
        mountVolumes = [],
        env = {},
        image,
        restart,
        network,
        name,
        entrypoint,
        command = '',
        healthCheck,
        securityOptions = []
    } = options;

    const restartArg = restart && `--restart ${ restart }`;
    const networkArg = network && `--network ${ network }`;
    const exposeArgs = expose.map((port) => `--expose ${ port }`).join(' ');
    const portsArgs = ports.map((port) => `-p ${ port }`).join(' ');
    const mountsArgs = mounts.map((mount) => `--mount ${ mount }`).join(' ');
    const mountVolumesArgs = mountVolumes.map((mount) => `-v ${mount}`).join(' ');
    const envArgs = Object.entries(env).map(([key, value]) => `--env ${ key }=${ value }`).join(' ');
    const nameArg = name && `--name ${name}`;
    const entrypointArg = entrypoint && `--entrypoint "${entrypoint}"`;
    const healthCheckArg = healthCheck && Object.entries(healthCheck).map(([key, value]) => `--health-${key} '${value}'`).join(' ');
    const securityArg = securityOptions.length > 0 && securityOptions.map((opt) => `--security-opt ${opt}`).join(' ');

    const dockerCommand = [
        'docker',
        'run',
        '-d',
        nameArg,
        networkArg,
        restartArg,
        exposeArgs,
        portsArgs,
        mountsArgs,
        mountVolumesArgs,
        envArgs,
        entrypointArg,
        healthCheckArg,
        securityArg,
        image,
        command
    ].filter(Boolean).join(' ');

    return execAsyncSpawn(dockerCommand);
};

const stop = async (containers) => {
    await execAsyncSpawn(`docker container stop ${containers.join(' ')}`);
    await execAsyncSpawn(`docker container rm ${containers.join(' ')}`);
};

const pull = async (image) => execAsyncSpawn(`docker pull ${image}`);

const pullContainers = {
    title: 'Pulling container images',
    task: async ({ config: { docker } }, task) => {
        const containers = Object.values(docker.getContainers());
        const containerFilters = containers
            .map((container) => `-f=reference='${container.imageDetails.name}:${container.imageDetails.tag}'`)
            .join(' ');
        const existingImages = await execAsyncSpawn(`docker images ${containerFilters}`);
        const missingContainerImages = containers.filter((container) => !existingImages.split('\n')
            .some((line) => line.includes(container.imageDetails.name) && line.includes(container.imageDetails.tag)));

        if (missingContainerImages.length === 0) {
            task.skip();
            return;
        }

        return task.newListr(
            missingContainerImages.map((container) => ({
                title: `Pulling ${container._} image`,
                task: async () => pull(`${container.imageDetails.name}:${container.imageDetails.tag}`)
            })), {
                concurrent: true,
                exitOnError: true
            }
        );
    }
};

const startContainers = {
    title: 'Starting containers',
    task: async ({ ports, config: { docker } }, task) => {
        const containerList = await execAsyncSpawn('docker container ls');

        const missingContainers = Object.values(docker.getContainers(ports)).filter(
            ({ name }) => !containerList.includes(name)
        );

        if (missingContainers.length === 0) {
            task.skip();
            return;
        }

        // TODO: we might stop containers here ?
        await Promise.all(missingContainers.map((container) => run(container).then((out) => {
            task.output = `From ${container._}: ${out}`;
        })));
    },
    options: {
        bottomBar: 10
    }
};

const stopContainers = {
    title: 'Stopping containers',
    task: async ({ ports, config: { docker } }, task) => {
        const containerList = await execAsyncSpawn('docker container ls -a');

        const runningContainers = Object.values(docker.getContainers(ports)).filter(
            ({ name }) => containerList.includes(name)
        );

        if (runningContainers.length === 0) {
            task.skip();
            return;
        }

        await stop(runningContainers.map(({ name }) => name));
    }
};
const getContainerStatus = async (containerName) => {
    try {
        return JSON.parse(await execAsyncSpawn(`docker inspect --format='{{json .State.Health}}' ${containerName}`));
    } catch {
        return null;
    }
};

const statusContainers = {
    task: async (ctx) => {
        const { config: { docker }, ports } = ctx;
        const containers = Object.values(docker.getContainers(ports));

        ctx.containers = await Promise.all(
            containers.map(async (container) => ({
                ...container,
                status: await getContainerStatus(container.name)
            }))
        );
    },
    options: {
        bottomBar: 10
    }
};

module.exports = {
    startContainers,
    stopContainers,
    pullContainers,
    statusContainers
};
