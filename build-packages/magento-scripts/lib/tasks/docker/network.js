const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { execAsyncSpawn } = require('../../util/exec-async-command');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const createNetwork = () => ({
    title: 'Deploying Docker network',
    task: async ({ config: { docker } }, task) => {
        const networkList = (await execAsyncSpawn("docker network ls --format '{{.Name}}'")).split('\n');

        if (networkList.includes(docker.network.name)) {
            task.skip();
            return;
        }
        try {
            await execAsyncSpawn(`docker network create --driver=bridge ${ docker.network.name }`);
        } catch (e) {
            if (e.includes('could not find an available, non-overlapping IPv4 address pool')) {
                const pruneNetworks = await task.prompt({
                    type: 'Confirm',
                    message: `You don't have available, non-overlapping IPv4 address pool on you system.
Do you want remove all custom networks not used by at least one container?`
                });

                if (pruneNetworks) {
                    return task.newListr(
                        pruneNetworks()
                    );
                }

                throw new Error(`Unable to create network for your project.
You need to delete unused networks yourself.
Use command ${logger.style.command('docker network prune')}`);
            }
        }
    }
});

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const removeNetwork = () => ({
    title: 'Removing Docker network',
    task: async ({ config: { docker } }, task) => {
        const networkList = (await execAsyncSpawn("docker network ls --format '{{.Name}}'")).split('\n');

        if (!networkList.includes(docker.network.name)) {
            task.skip();
            return;
        }

        await execAsyncSpawn(`docker network rm ${ docker.network.name }`);
    }
});

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const pruneNetworks = () => ({
    title: 'Removing custom networks not used by at least one container',
    task: () => execAsyncSpawn('docker network prune -f')
});

module.exports = {
    createNetwork,
    removeNetwork,
    pruneNetworks
};
