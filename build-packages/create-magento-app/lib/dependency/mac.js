const dependenciesForPlatforms = require('./dependencies-for-platforms')
const execAsync = require('../exec-async')
const installDependencies = require('./install-dependencies')

const macDependenciesCheck = async () => {
    const installedDependencies = (await execAsync('brew list')).split('\n')

    const dependenciesToInstall =
        dependenciesForPlatforms.darwin.dependencies.filter(
            (dep) => !installedDependencies.includes(dep)
        )

    if (dependenciesToInstall.length > 0) {
        return installDependencies({
            platform: 'darwin',
            dependenciesToInstall
        })
    }
}

module.exports = macDependenciesCheck
