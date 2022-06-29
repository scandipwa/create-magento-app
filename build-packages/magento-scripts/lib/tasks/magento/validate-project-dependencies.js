const path = require('path');
const fs = require('fs');
const { baseConfig } = require('../../config');

const getJsonfileData = require('../../util/get-jsonfile-data');
// const matchFilesystem = require('../../util/match-filesystem');
const pathExists = require('../../util/path-exists');

const composerLockPath = path.join(baseConfig.magentoDir, 'composer.lock');
const vendorDirPath = path.join(baseConfig.magentoDir, 'vendor');

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
        .flat();

    // eslint-disable-next-line max-len
    const missingDependencies = [...composerLockData.packages, ...composerLockData['packages-dev']].filter((p) => !vendorDependencies.some((vp) => vp.name === p.name));

    console.log(vendorDependencies, composerLockData, missingDependencies);

    // const vendorDependencies = await Promise.all();
};

module.exports = {
    validateProjectDependencies
};
