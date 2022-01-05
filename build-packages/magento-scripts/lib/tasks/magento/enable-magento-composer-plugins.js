const path = require('path');
const fs = require('fs');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const semver = require('semver');
const pathExists = require('../../util/path-exists');
const getJsonfileData = require('../../util/get-jsonfile-data');

const vendorPath = path.join(process.cwd(), 'vendor');
const composerJsonPath = path.join(process.cwd(), 'composer.json');

/**
 * @returns {Promise<string[]}
 */
const getInstalledComposerPlugins = async () => {
    const rootVendorFolders = await fs.promises.readdir(vendorPath, {
        encoding: 'utf-8',
        withFileTypes: true
    });

    const composerPlugins = (await Promise.all(
        rootVendorFolders.map(async (f) => {
            if (f.isDirectory()) {
                const vendorDirectoryPath = path.join(vendorPath, f.name);

                const vendorPackages = await fs.promises.readdir(vendorDirectoryPath, {
                    encoding: 'utf-8',
                    withFileTypes: true
                });

                const vendorPackagesComposerPlugins = (await Promise.all(
                    vendorPackages.map(async (p) => {
                        if (p.isDirectory()) {
                            const vendorPackageComposerJsonPath = path.join(vendorDirectoryPath, p.name, 'composer.json');

                            if (await pathExists(vendorPackageComposerJsonPath)) {
                                const {
                                    name: vendorPackageName,
                                    type: vendorPackageType
                                } = JSON.parse(await fs.promises.readFile(vendorPackageComposerJsonPath, {
                                    encoding: 'utf-8'
                                }));

                                if (vendorPackageType === 'composer-plugin') {
                                    return vendorPackageName;
                                }

                                return null;
                            }
                        }

                        return null;
                    })
                )).filter((p) => typeof p === 'string');

                return vendorPackagesComposerPlugins;
            }

            return null;
        })
    ))
        .reduce((acc, val) => acc.concat(val), []) // flattens the array
        .filter((p) => typeof p === 'string');

    return composerPlugins;
};

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const enableMagentoComposerPlugins = () => ({
    task: async (ctx, task) => {
        if (!semver.satisfies(ctx.composerVersion, '^2.2.0')) {
            task.skip();
            return;
        }

        task.title = 'Checking allowed composer plugins...';

        const composerPlugins = await getInstalledComposerPlugins();
        const composerJsonData = await getJsonfileData(composerJsonPath);
        const {
            config: {
                'allow-plugins': allowPlugins = {}
            }
        } = composerJsonData;
        const allowPluginsKeys = Object.keys(allowPlugins);

        if (
            allowPluginsKeys.length === 0
            || composerPlugins.some((p) => !allowPluginsKeys.includes(p))
        ) {
            const missingPlugins = composerPlugins.filter((p) => !allowPluginsKeys.includes(p));
            const answerForEnablingPlugins = await task.prompt({
                type: 'Select',
                message: `Composer 2.2 introduces strengthening of security by manually requiring allowing composer-plugins to run.
Magento requires the following plugins to correctly operate: ${missingPlugins.map((p) => logger.style.code(p)).join(', ')}

Do you want to enable them all or disable some of them?`,
                choices: ['enable all', 'configure manually', 'skip this step']
            });

            switch (answerForEnablingPlugins) {
            case 'enable all': {
                const userConfirmation = await task.prompt({
                    type: 'Confirm',
                    message: `Please confirm enabling of the following plugins:\n\n${missingPlugins.map((p) => logger.style.code(p)).join('\n')}\n`
                });

                if (userConfirmation) {
                    composerJsonData.config = {
                        ...composerJsonData.config,
                        'allow-plugins': {
                            ...allowPlugins,
                            ...missingPlugins.reduce((acc, val) => ({ ...acc, [val]: true }), {})
                        }
                    };

                    await fs.promises.writeFile(composerJsonPath, JSON.stringify(composerJsonData, null, 4), {
                        encoding: 'utf-8'
                    });
                } else {
                    throw new Error('Please confirm your choice or choose other option.');
                }
                break;
            }
            case 'configure manually': {
                const userEnabledPlugins = await task.prompt({
                    type: 'MultiSelect',
                    message: 'Please pick plugins you want to enable!',
                    choices: missingPlugins.map((p) => ({ name: p }))
                });

                const userConfirmation = await task.prompt({
                    type: 'Confirm',
                    message: `Please confirm enabling of the following plugins:\n\n${userEnabledPlugins.map((p) => logger.style.code(p)).join('\n')}\n`
                });

                if (userConfirmation) {
                    const disabledPlugins = composerPlugins.filter((p) => !userEnabledPlugins.includes(p));

                    composerJsonData.config = {
                        ...composerJsonData.config,
                        'allow-plugins': {
                            ...allowPlugins,
                            ...disabledPlugins.reduce((acc, val) => ({ ...acc, [val]: false }), {}),
                            ...userEnabledPlugins.reduce((acc, val) => ({ ...acc, [val]: true }), {})
                        }
                    };

                    await fs.promises.writeFile(composerJsonPath, JSON.stringify(composerJsonData, null, 4), {
                        encoding: 'utf-8'
                    });
                } else {
                    throw new Error('Please confirm your choice or choose other option.');
                }

                break;
            }
            case 'skip this step': {
                task.skip();
                break;
            }
            default: {
                //
            }
            }
        }
    }
});

module.exports = enableMagentoComposerPlugins;
