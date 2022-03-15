const archDependenciesCheck = require('./arch');
const fedoraDependenciesCheck = require('./fedora');
const centosDependenciesCheck = require('./centos');
const ubuntuDependenciesCheck = require('./ubuntu');
const macDependenciesCheck = require('./mac');
const osPlatform = require('../../../util/os-platform');

const dependencyCheck = async () => {
    if (process.platform === 'darwin') {
        return macDependenciesCheck();
    }

    const distro = await osPlatform();
    switch (distro) {
    case 'Arch Linux': {
        return archDependenciesCheck();
    }
    case 'Fedora': {
        return fedoraDependenciesCheck();
    }
    case 'CentOS': {
        return centosDependenciesCheck();
    }
    case 'Ubuntu': {
        return ubuntuDependenciesCheck();
    }
    default: {
        // skip check
    }
    }
};

module.exports = dependencyCheck;
