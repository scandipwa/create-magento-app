const dependenciesForPlatforms = require('./dependencies-for-platforms')
const execAsync = require('../exec-async')
const installDependencies = require('./install-dependencies')

const fedoraDependenciesCheck = async () => {
    const installedDependencies = (await execAsync('dnf list installed'))
        .split('\n')
        .filter((pkg) => !pkg.toLowerCase().includes('installed packages'))
        .map((pkg) => pkg.match(/^(\S+)/i))
        .filter((pkg) => pkg)
        .map((pkg) => pkg[1])
        .map((pkg) => pkg.match(/^(\S+)\.\S+/i))
        .map((pkg) => pkg[1])

    const dependenciesToInstall =
        dependenciesForPlatforms.Fedora.dependencies.filter(
            (dep) => !installedDependencies.includes(dep)
        )

    if (dependenciesToInstall.length > 0) {
        return installDependencies({
            platform: 'Fedora',
            dependenciesToInstall
        })
    }
}

module.exports = fedoraDependenciesCheck
