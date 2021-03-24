/* eslint-disable no-multi-str */
const osPlatform = require('./os-platform');
const os = require('os');
const dependenciesForPlatforms = require('../config/dependencies-for-platforms');

const getInstallDependenciesCommand = async () => {
    switch (os.platform()) {
    /**
         * Using array for pretty arrangement and pretty print later in logs.
         */
    case 'darwin': {
        return `brew install ${ dependenciesForPlatforms.darwin.join(' ')}`;
    }
    case 'linux': {
        const { dist } = await osPlatform();
        switch (dist) {
        case 'Arch Linux':
        case 'Manjaro': {
            return `pamac install ${ dependenciesForPlatforms['Arch Linux'].join(' ') }`;
        }
        case 'Fedora':
        case 'CentOS': {
            return `yum install ${ ['--enablerepo=PowerTools', ...dependenciesForPlatforms.Fedora].join(' ')}`;
        }
        case 'Linux Mint':
        case 'Ubuntu':
        default: {
            return `apt-get install ${ dependenciesForPlatforms.Ubuntu.join(' ')}`;
        }
        }
    }
    default: {
        return 'platform is not supported';
    }
    }
};

module.exports = getInstallDependenciesCommand;
