const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const os = require('os');
const dependenciesForPlatforms = require('../../../config/dependencies-for-platforms');
const { execAsyncSpawn, execCommandTask } = require('../../../util/exec-async-command');
const installDependenciesTask = require('../../../util/install-dependencies-task');

const pkgRegex = /^(\S+)\/\S+\s(\S+)\s\S+\s\S+$/i;

const updateSystem = () => ({
    title: 'Updating your system',
    task: async (ctx, task) => {
        task.output = 'Enter your sudo password!';
        task.output = logger.style.command(`>[sudo] password for ${ os.userInfo().username }:`);

        return task.newListr(
            execCommandTask('sudo apt update', {
                callback: (t) => {
                    task.output = t;
                },
                pipeInput: true
            })
        );
    },
    options: {
        bottomBar: 10
    }
});

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const ubuntuDependenciesCheck = () => ({
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
            const runSystemUpdate = await task.prompt({
                type: 'Confirm',
                message: `Would you like to run ${logger.style.command('apt update')} before installing missing ${dependenciesToInstall.length} dependenc${dependenciesToInstall.length > 1 ? 'ies' : 'y'}?`
            });

            if (runSystemUpdate) {
                return task.newListr([
                    updateSystem(),
                    installDependenciesTask({
                        platform: 'Ubuntu',
                        dependenciesToInstall
                    })
                ], {
                    concurrent: false
                });
            }

            return task.newListr(
                installDependenciesTask({
                    platform: 'Ubuntu',
                    dependenciesToInstall
                })
            );
        }
    },
    options: {
        bottomBar: 10
    }
});

module.exports = ubuntuDependenciesCheck;
