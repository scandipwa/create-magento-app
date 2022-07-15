/* eslint-disable max-len */
const { execAsyncSpawn } = require('../../util/exec-async-command');
const sleep = require('../../util/sleep');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const KnownError = require('../../errors/known-error');

/**
 * @param {Object} containerOptions
 * @param {number[]} [containerOptions.ports] Publish or expose port [docs](https://docs.docker.com/engine/reference/commandline/run/#publish-or-expose-port--p---expose)
 * @param {number[]} [containerOptions.mounts] Add bind mounts or volumes using the --mount flag [docs](https://docs.docker.com/engine/reference/commandline/run/#add-bind-mounts-or-volumes-using-the---mount-flag)
 * @param {number[]} [containerOptions.mountVolumes] Mount volume [docs](https://docs.docker.com/engine/reference/commandline/run/#mount-volume--v---read-only)
 * @param {Record<string, string>} [containerOptions.env] Set environment variables [docs](https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file)
 * @param {string} [containerOptions.image]
 * @param {string} [containerOptions.restart] Restart policies [docs](https://docs.docker.com/engine/reference/commandline/run/#restart-policies---restart)
 * @param {string} [containerOptions.name] Container name
 * @param {string} [containerOptions.entrypoint] Container entrypoint
 * @param {string} [containerOptions.command] Container command
 * @param {Record<"cmd" | "interval" | "retries" | "start-period" | "timeout", string>} [containerOptions.healthCheck] Container heathcheck properties
 * @param {string[]} [containerOptions.securityOptions] Security options [docs](https://docs.docker.com/engine/reference/commandline/run/#optional-security-options---security-opt)
 * @param {string[]} [containerOptions.tmpfs]
 * @param {import('../../util/exec-async-command').ExecAsyncSpawnOptions<false>} execOptions
 */
const run = (containerOptions, execOptions = {}) => {
    const {
        ports = [],
        mounts = [],
        mountVolumes = [],
        env,
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
    } = containerOptions;

    const exposeArg = expose && expose.map((e) => `--expose=${ e }`);
    const restartArg = restart && `--restart ${ restart }`;
    const networkArg = network && `--network ${ network }`;
    const portsArgs = ports.map((port) => `-p ${ port }`).join(' ');
    const mountsArgs = mounts.map((mount) => `--mount ${ mount }`).join(' ');
    const mountVolumesArgs = mountVolumes.map((mount) => `-v ${mount}`).join(' ');
    const envArgs = !env ? '' : Object.entries(env).map(([key, value]) => `--env ${ key }=${ `${value}`.startsWith('{') && `${value}`.endsWith('}') ? `"${ value }"` : value }`).join(' ');
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

    return execAsyncSpawn(dockerCommand, execOptions);
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

/**
 * @param {string} command
 * @param {string} container container id or name
 * @param {Object} options
 * @param {Record<string, string>} [options.env] Set environment variables [docs](https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file)
 * @param {string} [options.workdir] Working directory inside the container
 * @param {string} [options.user] Username or UID (format: <name|uid>[:<group|gid>])
 * @param {string} [options.tty] Allocate a pseudo-TTY
 */
const exec = (command, container, options = {}) => {
    const {
        env,
        tty,
        user,
        workdir
    } = options;
    const envArgs = !env ? '' : Object.entries(env).map(([key, value]) => `--env ${ key }=${ `${value}`.startsWith('{') && `${value}`.endsWith('}') ? `"${ value }"` : value }`).join(' ');
    const ttyArg = tty ? '--tty' : '';
    const userArg = user ? `--user=${user}` : '';
    const workdirArg = workdir ? `--workdir=${workdir}` : '';

    const execCommand = [
        'docker',
        'container',
        'exec',
        envArgs,
        ttyArg,
        userArg,
        workdirArg,
        container,
        command
    ].filter(Boolean).join(' ');

    return execAsyncSpawn(execCommand);
};

module.exports = {
    startContainers,
    stopContainers,
    pullContainers,
    statusContainers,
    checkContainersAreRunning,
    getContainerStatus,
    runContainer: run,
    execContainer: exec
};
