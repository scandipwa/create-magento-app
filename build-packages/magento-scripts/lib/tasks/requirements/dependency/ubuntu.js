/* eslint-disable consistent-return,no-param-reassign */
const dependenciesForPlatforms = require('../../../config/dependencies-for-platforms');
const { execAsyncSpawn } = require('../../../util/exec-async-command');
const installDependenciesTask = require('../../../util/install-dependencies-task');

const pkgRegex = /^(\S+)\/\S+\s(\S+)\s\S+\s\S+$/i;

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const ubuntuDependenciesCheck = {
    title: 'Checking Ubuntu Linux dependencies',
    task: async (ctx, task) => {
        const installedDependencies = (await execAsyncSpawn('apt list --installed')).split('\n')
            .filter((pkg) => pkgRegex.test(pkg))
            .map((pkg) => pkg.match(pkgRegex))
            .map((pkg) => pkg[1]);

        const dependenciesToInstall = dependenciesForPlatforms
            .Ubuntu
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
                    platform: 'Ubuntu',
                    dependenciesToInstall
                })
            ]);
        }
    },
    options: {
        bottomBar: 10
    }
};

module.exports = ubuntuDependenciesCheck;
