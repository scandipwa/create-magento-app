/* eslint-disable no-await-in-loop,no-restricted-syntax,no-param-reassign */
const path = require('path');
const os = require('os');
const fs = require('fs');
const runComposerCommand = require('../../util/run-composer');
const matchFilesystem = require('../../util/match-filesystem');
const moveFile = require('../../util/move-file');
const pathExists = require('../../util/path-exists');
const getJsonFileData = require('../../util/get-jsonfile-data');
const getJsonfileData = require('../../util/get-jsonfile-data');

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const installMagento = {
    title: 'Installing Magento',
    task: async (ctx, task) => {
        const { magentoVersion, config: { baseConfig, overridenConfiguration } } = ctx;

        const isFsMatching = await matchFilesystem(baseConfig.magentoDir, {
            'app/etc': [
                'env.php'
            ],
            'bin/magento': true,
            'composer.json': true,
            'composer.lock': true
        });

        if (isFsMatching) {
            task.skip();
            return;
        }

        const { magento: { edition: magentoEdition }, magentoVersion: magentoPackageVersion } = overridenConfiguration;
        // const isEnterprise = magentoEdition === 'enterprise';

        task.title = 'Creating Magento project...';

        const magentoPackage = `magento/product-${magentoEdition}-edition`;

        if (await pathExists(path.join(baseConfig.magentoDir, 'composer.json'))) {
            const composerData = await getJsonFileData(path.join(baseConfig.magentoDir, 'composer.json'));

            if (!composerData.repositories
                || (Array.isArray(composerData.repositories)
                    && !composerData.repositories.some((repo) => repo.type === 'composer' && repo.url === 'https://repo.magento.com/')
                )
                || (typeof composerData.repositories === 'object'
                    && !Object.values(composerData.repositories).some((repo) => repo.type === 'composer' && repo.url === 'https://repo.magento.com/'))
            ) {
                await runComposerCommand('config repo.0 composer https://repo.magento.com', {
                    magentoVersion,
                    callback: (t) => {
                        task.output = t;
                    }
                });
            }

            if (!composerData.require[magentoPackage]) {
                await runComposerCommand(`require ${magentoPackage}${magentoPackageVersion ? `:${magentoPackageVersion}` : ''}`,
                    {
                        magentoVersion,
                        callback: (t) => {
                            task.output = t;
                        }
                    });
            }
            if (!composerData.require['magento/composer-root-update-plugin']) {
                await runComposerCommand('require magento/composer-root-update-plugin:~1.0',
                    {
                        magentoVersion,
                        callback: (t) => {
                            task.output = t;
                        }
                    });
            }
        } else {
            const tempDir = path.join(os.tmpdir(), `magento-tmpdir-${Date.now()}`);
            try {
                const installCommand = `create-project \
                --repository=https://repo.magento.com/ ${magentoPackage}${magentoPackageVersion ? `=${magentoPackageVersion}` : ''} \
                --no-install ${tempDir}`;

                await runComposerCommand(
                    installCommand,
                    {
                        magentoVersion,
                        callback: (t) => {
                            task.output = t;
                        }
                    }
                );
            } catch (e) {
                if (e.message.includes(`Could not find package ${magentoPackage} with stability stable.`)) {
                    throw new Error(`Unexpected error during create-project command!

${e}

Probably the account you are using does not have access to download the ${magentoEdition} edition.`);
                }

                throw e;
            }

            await moveFile({
                from: path.join(tempDir, 'composer.json'),
                to: path.join(process.cwd(), 'composer.json')
            });

            await fs.promises.rmdir(tempDir);
        }

        try {
            await runComposerCommand('install',
                {
                    magentoVersion,
                    callback: (t) => {
                        task.output = t;
                    }
                });
        } catch (e) {
            if (e.message.includes('man-in-the-middle attack')) {
                throw new Error(`Probably you haven't setup pubkeys in composer.
                Please run composer diagnose in cli to get mode.\n\n${e}`);
            }

            throw new Error(`Unexpected error during composer install.\n\n${e}`);
        }
        task.title = 'Magento installed!';
        ctx.checkForInstalledThemesAfterStartUp = true;
        if (await pathExists(path.join(baseConfig.magentoDir, 'composer.json'))) {
            const composerData = await getJsonfileData(path.join(baseConfig.magentoDir, 'composer.json'));
            const composerLocalPathes = Array.isArray(composerData.repositories)
                ? composerData.repositories.filter((repo) => repo.type === 'path')
                : Object.values(composerData.repositories).filter((repo) => repo.type === 'path');

            const composerExistingLocalPathes = [];
            for (const localPath of composerLocalPathes) {
                if (
                    await pathExists(localPath.url)
                    && await pathExists(path.join(process.cwd(), localPath.url, 'composer.json'))
                    && await pathExists(path.join(process.cwd(), localPath.url, 'package.json'))
                ) {
                    const localPathPackageJsonData = await getJsonfileData(path.join(process.cwd(), localPath.url, 'package.json'));
                    const localPathComposerData = await getJsonfileData(path.join(process.cwd(), localPath.url, 'composer.json'));
                    if (localPathPackageJsonData.scandipwa
                        && localPathPackageJsonData.scandipwa.type === 'theme'
                        && composerData.require[localPathComposerData.name]
                    ) {
                        composerExistingLocalPathes.push(localPath.url);
                    }
                }
            }
            ctx.themePaths = composerExistingLocalPathes;
        }
    },
    options: {
        bottomBar: 10
    }
};

module.exports = installMagento;
