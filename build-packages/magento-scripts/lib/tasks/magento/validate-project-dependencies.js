const path = require('path');
const fs = require('fs');
const { baseConfig } = require('../../config');

const getJsonfileData = require('../../util/get-jsonfile-data');
// const matchFilesystem = require('../../util/match-filesystem');
const pathExists = require('../../util/path-exists');

const composerLockPath = path.join(baseConfig.magentoDir, 'composer.lock');
const vendorDirPath = path.join(baseConfig.magentoDir, 'vendor');

const packageTypes = [
    'library',
    'magento2-module',
    'magento-module',
    'composer-plugin',
    'magento2-library',
    'magento2-language',
    'magento2-component',
    'magento2-theme',
    'symfony-bundle',
    'application',
    'phpcodesniffer-standard'
];

const validateProjectDependencies = async () => {
    if (!await pathExists(composerLockPath) || !await pathExists(vendorDirPath)) {
        return false;
    }

    const composerLockData = await getJsonfileData(composerLockPath);
    const vendorFolder = await fs.promises.readdir(vendorDirPath, {
        withFileTypes: true,
        encoding: 'utf-8'
    });

    const vendorDependencies = (await Promise.all(
        vendorFolder
            .filter((vd) => vd.isDirectory())
            .map(async (vd) => {
                if (!await pathExists(path.join(vendorDirPath, vd.name))) {
                    return false;
                }

                const vendorDependencies = await fs.promises.readdir(path.join(vendorDirPath, vd.name), {
                    encoding: 'utf-8',
                    withFileTypes: true
                });

                const vendorDependenciesComposerData = await Promise.all(
                    vendorDependencies
                        .filter((f) => f.isDirectory())
                        .map(async (f) => {
                            const dependencyComposerJsonPath = path.join(vendorDirPath, vd.name, f.name, 'composer.json');
                            if (!await pathExists(dependencyComposerJsonPath)) {
                                return false;
                            }

                            const composerJsonData = await getJsonfileData(dependencyComposerJsonPath);

                            return composerJsonData;
                        })
                );

                return vendorDependenciesComposerData;
            })
    ))
        .flat()
        .filter((p) => p.version && packageTypes.includes(p.type));

    const composerLockMagentoDependencies = [...composerLockData.packages, ...composerLockData['packages-dev']].filter(
        (p) => packageTypes.includes(p.type) && (p.dist && p.dist.url && p.dist.url.startsWith('https://repo.magento.com'))
    );

    const missingDependencies = composerLockMagentoDependencies.filter((d) => !vendorDependencies.some((vd) => vd.name === d.name));

    // const a = [...composerLockData.packages, ...composerLockData['packages-dev']].reduce(
    //     (acc, val) => acc.concat(acc.includes(val.type) ? [] : [val.type]), []
    // );
    // eslint-disable-next-line max-len
    // const missingDependencies = [...composerLockData.packages, ...composerLockData['packages-dev']].filter((p) => !vendorDependencies.some((vp) => vp.name === p.name));

    console.log(vendorDependencies, composerLockData, missingDependencies);

    // const vendorDependencies = await Promise.all();
};

module.exports = {
    validateProjectDependencies
};
