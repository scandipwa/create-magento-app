const dependenciesForPlatforms = require('./dependencies-for-platforms')
const execAsync = require('../exec-async')
const installDependencies = require('./install-dependencies')

const fedoraDependenciesCheck = async () => {
    let installedDependencies
    try {
        installedDependencies = await execAsync('dnf list --installed')
    } catch (error) {
        console.error(
            'Fedora dependencies check: Error while checking dependencies',
            error
        )

        throw error
    }

    const formattedInstalledDependencies = installedDependencies
        .split('\n')
        .map((pkg) => pkg.match(/^(\S+)/i))
        .filter(Boolean)
        .map((pkg) => pkg[1])
        .map((pkg) => pkg.match(/^(\S+)\.\S+/i))
        .filter(Boolean)
        .map((pkg) => pkg[1])

    const dependenciesToInstall =
        dependenciesForPlatforms.Fedora.dependencies.filter(
            (dep) => !formattedInstalledDependencies.includes(dep)
        )

    if (dependenciesToInstall.length > 0) {
        return installDependencies({
            platform: 'Fedora',
            dependenciesToInstall
        })
    }
}

module.exports = fedoraDependenciesCheck
