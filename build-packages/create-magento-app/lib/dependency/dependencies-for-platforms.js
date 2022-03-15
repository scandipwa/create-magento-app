const dependenciesForPlatforms = {
    darwin: {
        dependencies: [
            'cmake'
        ],
        installCommand: (deps) => `brew install ${deps}`,
        packageManager: 'brew'
    },
    'Arch Linux': {
        dependencies: [
            'cmake'
        ],
        installCommand: (deps) => `sudo pacman -S ${deps} --noconfirm`,
        packageManager: 'pacman'
    },
    Fedora: {
        dependencies: [
            'cmake'
        ],
        installCommand: (deps) => `sudo yum install ${deps} -y`,
        packageManager: 'yum'
    },
    CentOS: {
        dependencies: [
            'cmake'
        ],
        installCommand: (deps) => `sudo yum install --enablerepo=PowerTools ${deps} -y`,
        packageManager: 'yum'
    },
    Ubuntu: {
        dependencies: [
            'cmake',
            'build-essential'
        ],
        installCommand: (deps) => `sudo apt-get install ${deps} -y`,
        packageManager: 'apt'
    }
};

module.exports = dependenciesForPlatforms;
