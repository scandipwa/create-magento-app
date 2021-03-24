const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const dependenciesForPlatforms = require('../../../config/dependencies-for-platforms');
const { execAsyncSpawn } = require('../../../util/exec-async-command');

const pkgRegex = /(\S+)\s(\S+)/i;

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const archDependenciesCheck = {
    title: 'Checking Arch Linux dependencies',
    task: async () => {
        const installedDependencies = (await execAsyncSpawn('pacman -Qe')).split('\n')
            .map((pkg) => {
                const result = pkg.match(pkgRegex);

                if (!result) {
                    throw new Error(`Package without a version!\n\n${pkg}\n\nHOW?`);
                }

                return [result[1], result[2]];
            });

        const dependenciesToInstall = dependenciesForPlatforms['Arch Linux'].filter((dep) => !installedDependencies.some((pkg) => pkg[0] === dep));

        if (dependenciesToInstall.length > 0) {
            throw new Error(`Missing dependencies detected!\n\nYou can install them by running the following command: ${ logger.style.code(`pamac install ${dependenciesToInstall.join(' ') }`)}`);
        }
    }
};

module.exports = archDependenciesCheck;
