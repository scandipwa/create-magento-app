/* eslint-disable max-len */
const { execAsyncSpawn } = require('../../util/exec-async-command');
const sleep = require('../../util/sleep');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const KnownError = require('../../errors/known-error');

/**
 * @param {Object} options
 * @param {number[]} [options.ports] Publish or expose port [docs](https://docs.docker.com/engine/reference/commandline/run/#publish-or-expose-port--p---expose)
 * @param {number[]} [options.mounts] Add bind mounts or volumes using the --mount flag [docs](https://docs.docker.com/engine/reference/commandline/run/#add-bind-mounts-or-volumes-using-the---mount-flag)
 * @param {number[]} [options.mountVolumes] Mount volume [docs](https://docs.docker.com/engine/reference/commandline/run/#mount-volume--v---read-only)
 * @param {Record<string, string>} [options.env] Set environment variables [docs](https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file)
 * @param {string} [options.image]
 * @param {string} [options.restart] Restart policies [docs](https://docs.docker.com/engine/reference/commandline/run/#restart-policies---restart)
 * @param {string} [options.name] Container name
 * @param {string} [options.entrypoint] Container entrypoint
 * @param {string} [options.command] Container command
 * @param {Record<"cmd" | "interval" | "retries" | "start-period" | "timeout", string>} [options.healthCheck] Container heathcheck properties
 * @param {string[]} [options.securityOptions] Security options [docs](https://docs.docker.com/engine/reference/commandline/run/#optional-security-options---security-opt)
 * @param {string[]} [options.tmpfs]
 */
const run = (options) => {
    const {
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
        securityOptions = [],
        tmpfs = [],
        expose = []
    } = options;

    const exposeArg = expose && expose.map((e) => `--expose=${ e }`);
    const restartArg = restart && `--restart ${ restart }`;
    const networkArg = network && `--network ${ network }`;
    const portsArgs = ports.map((port) => `-p ${ port }`).join(' ');
    const mountsArgs = mounts.map((mount) => `--mount ${ mount }`).join(' ');
    const mountVolumesArgs = mountVolumes.map((mount) => `-v ${mount}`).join(' ');
    const envArgs = Object.entries(env).map(([key, value]) => `--env ${ key }=${ value }`).join(' ');
    const nameArg = name && `--name ${name}`;
    const entrypointArg = entrypoint && `--entrypoint "${entrypoint}"`;
    const healthCheckArg = healthCheck && Object.entries(healthCheck).map(([key, value]) => `--health-${key} '${value}'`).join(' ');
    const securityArg = securityOptions.length > 0 && securityOptions.map((opt) => `--security-opt ${opt}`).join(' ');
    const tmpfsArg = tmpfs.length > 0 && tmpfs.map((t) => `--tmpfs ${t}`).join(' ');

    const dockerCommand = [
        'docker',
        'run',
        '-d',
        nameArg,
        networkArg,
        restartArg,
        portsArgs,
        exposeArg,
        mountsArgs,
        mountVolumesArgs,
        envArgs,
        entrypointArg,
        healthCheckArg,
        securityArg,
        tmpfsArg,
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

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const pullContainers = () => ({
    title: 'Pulling container images',
    task: async ({ config: { docker } }, task) => {
        const containers = Object.values(docker.getContainers());
        const containerFilters = containers
            .map((container) => `-f=reference='${container.imageDetails.name}:${container.imageDetails.tag}'`)
            .join(' ');
        const existingImages = await execAsyncSpawn(`docker images ${containerFilters}`);
        const missingContainerImages = containers.filter((container) => !existingImages.split('\n')
            .some((line) => line.includes(container.imageDetails.name) && line.includes(container.imageDetails.tag)))
            .reduce((acc, val) => acc.concat(acc.some((c) => c.imageDetails.name === val.imageDetails.name && c.imageDetails.tag === val.imageDetails.tag) ? [] : val), []);

        if (missingContainerImages.length === 0) {
            task.skip();
            return;
        }

        return task.newListr(
            missingContainerImages.map((container) => ({
                title: `Pulling ${ logger.style.file(`${container.imageDetails.name}:${container.imageDetails.tag}`) } image`,
                task: () => pull(`${container.imageDetails.name}:${container.imageDetails.tag}`)
            })), {
                concurrent: true,
                exitOnError: true
            }
        );
    }
});

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const startContainers = () => ({
    title: 'Starting containers',
    task: async ({ ports, config: { docker } }, task) => {
        const containerList = (await execAsyncSpawn('docker container ls --all --format="{{.Names}}"')).split('\n');

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
});

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const stopContainers = () => ({
    title: 'Stopping Docker containers',
    task: async ({ config: { baseConfig: { prefix } } }, task) => {
        const containerList = (await execAsyncSpawn('docker container ls --all --format="{{.Names}}"')).split('\n');

        const runningContainers = containerList.filter((containerName) => containerName.startsWith(prefix));

        if (runningContainers.length === 0) {
            task.skip();
            return;
        }

        await stop(runningContainers);
    }
});

const getContainerStatus = async (containerName) => {
    try {
        return JSON.parse(await execAsyncSpawn(`docker inspect --format='{{json .State}}' ${containerName}`));
    } catch {
        return null;
    }
};

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const checkContainersAreRunning = () => ({
    title: 'Checking container statuses',
    task: async (ctx, task) => {
        const { config: { docker }, ports } = ctx;
        const containers = Object.values(docker.getContainers(ports));
        let tries = 0;
        while (tries < 3) {
            const containersWithStatus = await Promise.all(
                containers.map(async (container) => ({
                    ...container,
                    status: await getContainerStatus(container.name)
                }))
            );

            if (containersWithStatus.some((c) => c.status.Status !== 'running')) {
                if (tries === 2) {
                    throw new KnownError(`${containersWithStatus.filter((c) => c.status.Status !== 'running').map((c) => c._).join(', ')} containers are not running! Please check container logs for more details!`);
                } else {
                    task.output = `${containersWithStatus.filter((c) => c.status.Status !== 'running').map((c) => c._).join(', ')} are not running, waiting if something will change...`;
                    await sleep(2000);
                    tries++;
                }
            } else {
                break;
            }
        }
    },
    options: {
        bottomBar: 10
    }
});

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const statusContainers = () => ({
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
});

module.exports = {
    startContainers,
    stopContainers,
    pullContainers,
    statusContainers,
    checkContainersAreRunning,
    getContainerStatus
};
