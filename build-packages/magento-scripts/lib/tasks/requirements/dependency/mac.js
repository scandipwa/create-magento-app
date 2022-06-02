const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const dependenciesForPlatforms = require('../../../config/dependencies-for-platforms');
const KnownError = require('../../../errors/known-error');
const { execAsyncSpawn } = require('../../../util/exec-async-command');
const {
    BREW_BIN_PATH_ARM_NATIVE,
    BREW_BIN_PATH_ARM_ROSETTA,
    getBrewCommand
} = require('../../../util/get-brew-bin-path');
const installDependenciesTask = require('../../../util/install-dependencies-task');
const pathExists = require('../../../util/path-exists');
/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const macDependenciesCheck = () => ({
    title: 'Checking MacOS dependencies',
    task: async (ctx, task) => {
        if (ctx.arch === 'arm64') {
            if (!await pathExists(BREW_BIN_PATH_ARM_ROSETTA) && await pathExists(BREW_BIN_PATH_ARM_NATIVE)) {
                throw new KnownError(`Missing rosetta brew!
Please make sure that you have installed brew in rosetta2 terminal!
Follow the instructions: ${logger.style.link('https://docs.create-magento-app.com/getting-started/prerequisites/installation-on-macos/installation-on-macos-apple-silicon')}`);
            }
        }
        const installedDependencies = (await execAsyncSpawn(`${await getBrewCommand()} list`)).split('\n');

        const dependenciesToInstall = dependenciesForPlatforms
            .darwin
            .dependencies
            .filter((dep) => !installedDependencies.includes(dep));

        if (dependenciesToInstall.length > 0) {
            return task.newListr(
                installDependenciesTask({
                    platform: 'darwin',
                    dependenciesToInstall,
                    useMacNativeEnvironment: false
                })
            );
        }
    },
    options: {
        bottomBar: 10
    }
});

module.exports = macDependenciesCheck;
