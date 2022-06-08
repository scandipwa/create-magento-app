const dependenciesForPlatforms = require('../../../config/dependencies-for-platforms');
const { execAsyncSpawn, execCommandTask } = require('../../../util/exec-async-command');
const {
    BREW_BIN_PATH_ARM_NATIVE,
    BREW_BIN_PATH_ARM_ROSETTA,
    BREW_BIN_PATH_INTEL,
    getBrewCommand
} = require('../../../util/get-brew-bin-path');
const installDependenciesTask = require('../../../util/install-dependencies-task');
const pathExists = require('../../../util/path-exists');

const brewInstallCommand = '$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)';

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const installBrewRosettaTask = () => ({
    title: 'Installing Brew using Rosetta 2',
    task: async (ctx, task) => {
        if (await pathExists(BREW_BIN_PATH_ARM_ROSETTA)) {
            task.skip('Brew in Rosetta is already installed');
            return;
        }

        return task.newListr(
            execCommandTask(brewInstallCommand, {
                useRosetta2: true
            })
        );
    }
});

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const installBrewNativeTask = () => ({
    title: 'Installing Brew',
    task: async (ctx, task) => {
        if (
            (ctx.arch === 'arm64' && await pathExists(BREW_BIN_PATH_ARM_NATIVE))
            || (ctx.arch === 'x64' && await pathExists(BREW_BIN_PATH_INTEL))
        ) {
            task.skip('Brew in native path is already installed');
            return;
        }

        return task.newListr(
            execCommandTask(brewInstallCommand, {
                useRosetta2: false
            })
        );
    }
});

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const macDependenciesCheck = () => ({
    title: 'Checking MacOS dependencies',
    task: async (ctx, task) => {
        const tasks = [installBrewNativeTask()];

        if (ctx.arch === 'arm64') {
            tasks.push(installBrewRosettaTask());
        }

        return task.newListr(
            tasks.concat([
                {
                    task: async () => {
                        const installDependenciesTasks = [];
                        if (ctx.arch === 'arm64') {
                            const installedNativeDependencies = (
                                await execAsyncSpawn(`${await getBrewCommand({ native: true })} list`, { useRosetta2: false })
                            ).split('\n');
                            const dependenciesToInstallOnArm = dependenciesForPlatforms['darwin-arm']
                                .dependencies
                                .filter((dep) => !installedNativeDependencies.includes(dep));

                            if (dependenciesToInstallOnArm.length > 0) {
                                installDependenciesTasks.push(
                                    installDependenciesTask({
                                        platform: 'darwin-arm',
                                        dependenciesToInstall: dependenciesToInstallOnArm,
                                        useMacNativeEnvironment: true
                                    })
                                );
                            }
                        }

                        const installedDependencies = (
                            await execAsyncSpawn(`${await getBrewCommand({ native: false })} list`, { useRosetta2: true })
                        ).split('\n');
                        const dependenciesToInstall = dependenciesForPlatforms
                            .darwin
                            .dependencies
                            .filter((dep) => !installedDependencies.includes(dep));

                        if (dependenciesToInstall.length > 0) {
                            installDependenciesTasks.push(
                                installDependenciesTask({
                                    platform: 'darwin',
                                    dependenciesToInstall,
                                    useMacNativeEnvironment: false
                                })
                            );
                        }

                        if (installDependenciesTasks.length > 0) {
                            return task.newListr(installDependenciesTasks);
                        }

                        task.skip();
                    }
                }
            ])
        );
    },
    options: {
        bottomBar: 10
    }
});

module.exports = macDependenciesCheck;
