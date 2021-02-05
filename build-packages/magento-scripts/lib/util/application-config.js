const path = require('path');
const fs = require('fs');
// const { config } = require('../config');
const pathExists = require('./path-exists');

/**
 * Get application config
 */
const getApplicationConfig = async () => {
    const configExists = await pathExists(
        path.join(process.cwd(), 'cma.json')
    );

    if (configExists) {
        return JSON.parse(await fs.promises.readFile(path.join(process.cwd(), 'cma.json'), 'utf-8'));
    }

    return null;
};

const saveApplicationConfig = async (appConfig) => {
    await fs.promises.writeFile(
        path.join(process.cwd(), 'cma.json'),
        JSON.stringify(appConfig, null, 2),
        'utf-8'
    );

    return true;
};

module.exports = {
    // defaultMagentoConfig,
    getApplicationConfig,
    saveApplicationConfig
};
