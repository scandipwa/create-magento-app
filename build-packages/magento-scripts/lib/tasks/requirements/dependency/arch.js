/* eslint-disable consistent-return,no-param-reassign */
const dependenciesForPlatforms = require('../../../config/dependencies-for-platforms');
const { execAsyncSpawn } = require('../../../util/exec-async-command');
const installDependenciesTask = require('../../../util/install-dependencies-task');

const pkgRegex = /(\S+)\s(\S+)/i;

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const archDependenciesCheck = {
    title: 'Checking Arch Linux dependencies',
    task: async (ctx, task) => {
        const installedDependencies = (await execAsyncSpawn('pacman -Q')).split('\n')
            .map((pkg) => {
                const result = pkg.match(pkgRegex);

                if (!result) {
                    throw new Error(`Package without a version!\n\n${pkg}\n\nHOW?`);
                }

                return result[1];
            });

        const dependenciesToInstall = dependenciesForPlatforms['Arch Linux']
            .dependencies
            .filter((dep) => {
                if (Array.isArray(dep)) {
                    return !dep.some((dp) => installedDependencies.includes(dp));
                }

                return !installedDependencies.includes(dep);
            })
            .map((dep) => (Array.isArray(dep) ? dep[0] : dep));

        if (dependenciesToInstall.length > 0) {
            return task.newListr([
                installDependenciesTask({
                    platform: 'Arch Linux',
                    dependenciesToInstall
                })
            ]);
        }
    },
    options: {
        bottomBar: 10
    }
};

module.exports = archDependenciesCheck;
