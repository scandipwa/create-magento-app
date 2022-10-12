const dependenciesForPlatforms = {
    darwin: {
        packageManager: 'brew'
    },
    'darwin-arm': {
        packageManager: 'brew'
    },
    'Arch Linux': {
        packageManager: 'pacman'
    },
    Fedora: {
        packageManager: 'dnf'
    },
    CentOS: {
        packageManager: 'yum'
    },
    Ubuntu: {
        packageManager: 'apt'
    }
};

module.exports = dependenciesForPlatforms;
