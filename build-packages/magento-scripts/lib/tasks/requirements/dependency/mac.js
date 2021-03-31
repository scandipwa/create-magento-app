/* eslint-disable consistent-return,no-param-reassign */
const dependenciesForPlatforms = require('../../../config/dependencies-for-platforms');
const { execAsyncSpawn } = require('../../../util/exec-async-command');
const installDependenciesTask = require('../../../util/install-dependencies-task');

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const macDependenciesCheck = {
    title: 'Checking MacOS dependencies',
    task: async (ctx, task) => {
        const installedDependencies = (await execAsyncSpawn('brew list')).split('\n');

        const dependenciesToInstall = dependenciesForPlatforms
            .darwin
            .dependencies
            .filter((dep) => !installedDependencies.includes(dep));

        if (dependenciesToInstall.length > 0) {
            return task.newListr([
                installDependenciesTask({
                    platform: 'darwin',
                    dependenciesToInstall
                })
            ]);
        }
    },
    options: {
        bottomBar: 10
    }
};

module.exports = macDependenciesCheck;
