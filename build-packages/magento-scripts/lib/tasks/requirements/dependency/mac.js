const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const dependenciesForPlatforms = require('../../../config/dependencies-for-platforms');
const { execAsyncSpawn } = require('../../../util/exec-async-command');

/**
 * @type {import('listr2').ListrTask<>}
 */
const macDependenciesCheck = {
    task: async () => {
        const installedDependencies = (await execAsyncSpawn('brew list')).split('\n');

        const dependenciesToInstall = dependenciesForPlatforms.darwin.filter((dep) => !installedDependencies.includes(dep));

        if (dependenciesToInstall.length > 0) {
            throw new Error(`Missing dependencies detected!\n\nYou can install them by running the following command: ${ logger.style.code(`brew install ${dependenciesToInstall.join(', ') }`)}`);
        }
    }
};

module.exports = macDependenciesCheck;
