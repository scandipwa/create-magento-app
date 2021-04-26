const path = require('path');

module.exports = ({ composer }, config) => {
    const { cacheDir } = config;

    return {
        dirPath: path.join(cacheDir, 'composer'),
        binPath: path.join(cacheDir, 'composer', 'composer.phar'),
        version: composer.version
    };
};
