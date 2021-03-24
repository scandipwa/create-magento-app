const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const dependenciesForPlatforms = require('../../../config/dependencies-for-platforms');
const { execAsyncSpawn } = require('../../../util/exec-async-command');

const pkgRegex = /^(\S+)\/\S+\s(\S+)\s\S+\s\S+$/i;

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const ubuntuDependenciesCheck = {
    title: 'Checking Ubuntu Linux dependencies',
    task: async () => {
        const installedDependencies = (await execAsyncSpawn('apt list --installed')).split('\n')
            .filter((pkg) => pkgRegex.test(pkg))
            .map((pkg) => pkg.match(pkgRegex))
            .map((pkg) => pkg[1]);

        const dependenciesToInstall = dependenciesForPlatforms
            .Ubuntu
            .filter((dep) => {
                if (Array.isArray(dep)) {
                    return !dep.some((dp) => installedDependencies.includes(dp));
                }

                return !installedDependencies.includes(dep);
            });

        if (dependenciesToInstall.length > 0) {
            throw new Error(`Missing dependencies detected!\n\nYou can install them by running the following command: ${ logger.style.code(`apt-get install ${dependenciesToInstall.map((dep) => (Array.isArray(dep) ? dep[0] : dep)).join(' ') }`)}`);
        }
    }
};

module.exports = ubuntuDependenciesCheck;
