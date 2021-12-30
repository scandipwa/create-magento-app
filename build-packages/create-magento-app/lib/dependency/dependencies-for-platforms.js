const dependenciesForPlatforms = {
    darwin: {
        dependencies: [
            'cmake'
        ],
        installCommand: (deps) => `brew install ${deps}`
    },
    'Arch Linux': {
        dependencies: [
            'cmake'
        ],
        installCommand: (deps) => `sudo pacman -S ${deps} --noconfirm`
    },
    Fedora: {
        dependencies: [
            'cmake'
        ],
        installCommand: (deps) => `sudo yum install ${deps} -y`
    },
    CentOS: {
        dependencies: [
            'cmake'
        ],
        installCommand: (deps) => `sudo yum install --enablerepo=PowerTools ${deps} -y`
    },
    Ubuntu: {
        dependencies: [
            'cmake',
            'build-essential'
        ],
        installCommand: (deps) => `sudo apt-get install ${deps} -y`
    }
};

module.exports = dependenciesForPlatforms;
