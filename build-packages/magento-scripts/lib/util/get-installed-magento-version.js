const fs = require('fs');
const path = require('path');
const pathExists = require('./path-exists');

const getComposerData = async (composerPath) => {
    const composerExists = await pathExists(composerPath);

    if (!composerExists) {
        return null;
    }

    return JSON.parse(await fs.promises.readFile(composerPath, 'utf-8'));
};

const getInstalledMagentoVersion = async (projectPath = process.cwd()) => {
    const composerData = await getComposerData(path.join(projectPath, 'composer.json'));

    if (!composerData) {
        throw new Error('composer.json not found');
    }
    const magentoDependency = [
        'magento/product-community-edition',
        'magento/product-enterprise-edition'
    ].find((magentoEdition) => composerData.require[magentoEdition]);

    if (!magentoDependency) {
        throw new Error('No Magento dependency found in composer.json');
    }

    return composerData.require[magentoDependency].replace(/\^/i, '');
};

module.exports = getInstalledMagentoVersion;
