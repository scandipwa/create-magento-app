const os = require('os');
const path = require('path');

const homePath = process.env.PHPBREW_HOME || os.homedir();
const phpbrewConfig = {
    homePath,
    buildPath: path.join(homePath, 'build'),
    phpPath: path.join(homePath, 'php'),
    bashrcPath: path.join(homePath, 'bashrc')
};

module.exports = phpbrewConfig;
