const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const dependenciesForPlatforms = require('../../../config/dependencies-for-platforms');
const { execAsyncSpawn } = require('../../../util/exec-async-command');

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const fedoraDependenciesCheck = {
    title: 'Checking Fedora Linux dependencies',
    task: async () => {
        const installedDependencies = (await execAsyncSpawn('yum list installed')).split('\n')
            .filter((pkg) => !pkg.toLowerCase().includes('installed packages'))
            .map((pkg) => pkg.match(/^(\S+)/i))
            .filter((pkg) => pkg)
            .map((pkg) => pkg[1])
            .map((pkg) => pkg.match(/^(\S+)\.\S+/i))
            .map((pkg) => pkg[1]);

        const dependenciesToInstall = dependenciesForPlatforms.Fedora.filter((dep) => !installedDependencies.includes(dep));

        if (dependenciesToInstall.length > 0) {
            throw new Error(`Missing dependencies detected!\n\nYou can install them by running the following command: ${ logger.style.code(`yum install ${dependenciesToInstall.join(', ') }`)}`);
        }
    }
};

module.exports = fedoraDependenciesCheck;
