const fs = require('fs');
const path = require('path');
const phpbrewConfig = require('../config/phpbrew');
const pathExists = require('./path-exists');

const getPHPForPHPBrewBin = async () => {
    if (!await pathExists(phpbrewConfig.phpPath)) {
        return '';
    }

    const buildedPHPs = await fs.promises.readdir(phpbrewConfig.phpPath, {
        encoding: 'utf-8',
        withFileTypes: true
    });

    const phpForPHPBrew = buildedPHPs.find((p) => p.isDirectory() && p.name.endsWith('phpbrew'));

    if (phpForPHPBrew) {
        const phpBinPath = path.join(phpbrewConfig.phpPath, phpForPHPBrew.name, 'bin');
        if (await pathExists(phpBinPath)) {
            return phpBinPath;
        }
    }

    return '';
};

module.exports = {
    getPHPForPHPBrewBin
};
