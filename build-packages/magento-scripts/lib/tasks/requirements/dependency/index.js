/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */
const os = require('os');
const osPlatform = require('../../../util/os-platform');
const archDependenciesCheck = require('./arch');
const fedoraDependenciesCheck = require('./fedora');
const ubuntuDependenciesCheck = require('./ubuntu');
const macDependenciesCheck = require('./mac');

const dependencyCheck = async () => {
    const currentPlatform = os.platform();

    if (currentPlatform === 'darwin') {
        return macDependenciesCheck;
    }

    const { dist } = await osPlatform();
    switch (dist) {
    case 'Arch Linux':
    case 'Manjaro': {
        return archDependenciesCheck;
    }
    case 'Fedora':
    case 'CentOS': {
        return fedoraDependenciesCheck;
    }
    case 'Linux Mint':
    case 'Ubuntu': {
        return ubuntuDependenciesCheck;
    }
    default: {
        //
    }
    }
};

module.exports = dependencyCheck;
