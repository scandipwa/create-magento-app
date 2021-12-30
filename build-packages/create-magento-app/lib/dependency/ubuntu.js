const dependenciesForPlatforms = require('./dependencies-for-platforms');
const execAsync = require('../exec-async');
const installDependencies = require('./install-dependencies');

const pkgRegex = /^(\S+)\/\S+\s(\S+)\s\S+\s\S+$/i;

const ubuntuDependenciesCheck = async () => {
    const installedDependencies = (await execAsync('apt list --installed')).split('\n')
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
        return installDependencies({
            platform: 'Ubuntu',
            dependenciesToInstall
        });
    }
};

module.exports = ubuntuDependenciesCheck;
