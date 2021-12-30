const dependenciesForPlatforms = require('./dependencies-for-platforms');
const execAsync = require('../exec-async');
const installDependencies = require('./install-dependencies');

const pkgRegex = /(\S+)\s(\S+)/i;

const archDependenciesCheck = async () => {
    const installedDependencies = (await execAsync('pacman -Q')).split('\n')
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
        return installDependencies({
            platform: 'Arch Linux',
            dependenciesToInstall
        });
    }
};

module.exports = archDependenciesCheck;
