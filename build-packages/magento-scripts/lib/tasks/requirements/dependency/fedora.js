/* eslint-disable consistent-return */
const dependenciesForPlatforms = require('../../../config/dependencies-for-platforms');
const { execAsyncSpawn } = require('../../../util/exec-async-command');
const installDependenciesTask = require('../../../util/install-dependencies-task');

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const fedoraDependenciesCheck = {
    title: 'Checking Fedora Linux dependencies',
    task: async (ctx, task) => {
        const installedDependencies = (await execAsyncSpawn('yum list installed')).split('\n')
            .filter((pkg) => !pkg.toLowerCase().includes('installed packages'))
            .map((pkg) => pkg.match(/^(\S+)/i))
            .filter((pkg) => pkg)
            .map((pkg) => pkg[1])
            .map((pkg) => pkg.match(/^(\S+)\.\S+/i))
            .map((pkg) => pkg[1]);

        const dependenciesToInstall = dependenciesForPlatforms
            .Fedora
            .dependencies
            .filter((dep) => !installedDependencies.includes(dep));

        if (dependenciesToInstall.length > 0) {
            return task.newListr([
                installDependenciesTask({
                    platform: 'Fedora',
                    dependenciesToInstall
                })
            ]);
        }
    }
};

module.exports = fedoraDependenciesCheck;
