const osPlatform = require('../os-platform')
const archDependenciesCheck = require('./arch')
const centosDependenciesCheck = require('./centos')
const fedoraDependenciesCheck = require('./fedora')
const macDependenciesCheck = require('./mac')
const ubuntuDependenciesCheck = require('./ubuntu')

const checkDependencies = async () => {
    if (process.platform === 'darwin') {
        return macDependenciesCheck()
    }

    const distro = await osPlatform()

    switch (distro) {
        case 'Arch Linux': {
            return archDependenciesCheck()
        }
        case 'Fedora': {
            return fedoraDependenciesCheck()
        }
        case 'CentOS': {
            return centosDependenciesCheck()
        }
        case 'Ubuntu': {
            return ubuntuDependenciesCheck()
        }
        default: {
            // skip check
        }
    }
}

module.exports = {
    checkDependencies
}
