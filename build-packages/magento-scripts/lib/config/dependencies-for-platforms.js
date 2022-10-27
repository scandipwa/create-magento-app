const { getBrewCommandSync } = require('../util/get-brew-bin-path')

const dependenciesForPlatforms = {
    darwin: {
        /**
         * @param {string} deps
         * @param {{ native?: boolean }} param1
         */
        installCommand: (deps, { native } = { native: false }) =>
            `${getBrewCommandSync({ native })} install ${deps}`,
        packageManager: 'brew'
    },
    'darwin-arm': {
        /**
         * @param {string} deps
         */
        installCommand: (deps, { native } = { native: false }) =>
            `${getBrewCommandSync({ native })} install ${deps}`,
        packageManager: 'brew'
    },
    'Arch Linux': {
        /**
         * @param {string} deps
         */
        installCommand: (deps) => `sudo pacman -S ${deps} --noconfirm`,
        packageManager: 'pacman'
    },
    Fedora: {
        /**
         * @param {string} deps
         */
        installCommand: (deps) => `sudo yum install ${deps} -y`,
        packageManager: 'yum'
    },
    CentOS: {
        /**
         * @param {string} deps
         */
        installCommand: (deps) =>
            `sudo yum install --enablerepo=PowerTools ${deps} -y`,
        packageManager: 'yum'
    },
    Ubuntu: {
        /**
         * @param {string} deps
         */
        installCommand: (deps) => `sudo apt install ${deps} -y`,
        packageManager: 'apt'
    }
}

module.exports = dependenciesForPlatforms
