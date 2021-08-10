const os = require('os');
const osPlatform = require('../../../util/os-platform');
const archDependenciesCheck = require('./arch');
const fedoraDependenciesCheck = require('./fedora');
const centosDependenciesCheck = require('./centos');
const ubuntuDependenciesCheck = require('./ubuntu');
const macDependenciesCheck = require('./mac');

const dependencyCheck = async () => {
    const currentPlatform = os.platform();

    if (currentPlatform === 'darwin') {
        return macDependenciesCheck();
    }

    const { dist } = await osPlatform();
    switch (dist) {
    case 'Arch Linux':
    case 'Manjaro Linux': {
        return archDependenciesCheck();
    }
    case 'Fedora': {
        return fedoraDependenciesCheck();
    }
    case 'CentOS': {
        return centosDependenciesCheck();
    }
    case 'Linux Mint':
    case 'Ubuntu': {
        return ubuntuDependenciesCheck();
    }
    default: {
        // skip check
    }
    }
};

module.exports = dependencyCheck;
