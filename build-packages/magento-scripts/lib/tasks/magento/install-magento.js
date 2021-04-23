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

const magentoProductEnterpriseEdition = 'magento/product-enterprise-edition';
const magentoProductCommunityEdition = 'magento/product-community-edition';

/**
 * Adjust composer.json file configuration for magento
 */
const adjustComposerJson = async ({
    baseConfig,
    magentoEdition,
    magentoProductSelectedEdition,
    magentoVersion,
    magentoPackageVersion,
    task
}) => {
    const composerData = await getJsonFileData(path.join(baseConfig.magentoDir, 'composer.json'));

    // fix composer magento repository
    if (!composerData.repositories
        || (Array.isArray(composerData.repositories)
            && !composerData.repositories.some((repo) => repo.type === 'composer' && repo.url.includes('repo.magento.com'))
        )
        || (typeof composerData.repositories === 'object'
            && !Object.values(composerData.repositories).some((repo) => repo.type === 'composer' && repo.url.includes('repo.magento.com')))
    ) {
        task.output = 'No Magento repository is set in composer.json! Setting up...';
        await runComposerCommand('config repo.0 composer https://repo.magento.com', {
            magentoVersion,
            callback: (t) => {
                task.output = t;
            }
        });
    }

    // if composer-root-update-plugin is not installed in composer, install it.
    if (!composerData.require['magento/composer-root-update-plugin']) {
        task.output = 'Installing magento/composer-root-update-plugin!';
        await runComposerCommand('require magento/composer-root-update-plugin:^1',
            {
                magentoVersion,
                callback: (t) => {
                    task.output = t;
                }
            });
    }

    // if for some reason both editions are installed, throw an error
    if (
        composerData.require[magentoProductCommunityEdition]
        && composerData.require[magentoProductEnterpriseEdition]
    ) {
        throw new Error('Somehow, both Magento editions are installed!\nPlease choose only one edition an modify your composer.json manually!');
    }

    const oppositeEdition = [magentoProductCommunityEdition, magentoProductEnterpriseEdition]
        .find((edition) => edition !== magentoProductSelectedEdition);

    // if opposite edition is installed than selected in config file, throw an error
    if (composerData.require[oppositeEdition]) {
        throw new Error(`You have installed ${oppositeEdition} but selected magento.edition as ${magentoEdition} in config file!

Change magento edition in config file or manually reinstall correct magento edition!`);
    }

    // if magento package is not installed in composer, require it.

    if (!composerData.require[magentoProductSelectedEdition]) {
        task.output = `Installing ${magentoProductSelectedEdition}=${magentoPackageVersion}!`;
        await runComposerCommand(`require ${magentoProductSelectedEdition}:${magentoPackageVersion}`,
            {
                magentoVersion,
                callback: (t) => {
                    task.output = t;
                }
            });
    }
};

/**
 * Create Magento Project
 */
const createMagentoProject = async ({
    magentoProject,
    magentoPackageVersion,
    magentoVersion,
    task
}) => {
    const tempDir = path.join(os.tmpdir(), `magento-tmpdir-${Date.now()}`);
    const installCommand = [
        'create-project',
        `--repository=https://repo.magento.com/ ${magentoProject}=${magentoPackageVersion}`,
        '--no-install',
        `"${tempDir}"`
    ];

    await runComposerCommand(
        installCommand.join(' '),
        {
            magentoVersion,
            callback: (t) => {
                task.output = t;
            }
        }
    );

    await moveFile({
        from: path.join(tempDir, 'composer.json'),
        to: path.join(process.cwd(), 'composer.json')
    });

    await fs.promises.rmdir(tempDir);
};

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const installMagento = {
    title: 'Installing Magento',
    task: async (ctx, task) => {
        const { magentoVersion, config: { baseConfig, overridenConfiguration } } = ctx;
        const {
            magento: { edition: magentoEdition },
            magentoVersion: magentoPackageVersion
        } = overridenConfiguration;
        const isEnterprise = magentoEdition === 'enterprise';
        const magentoProductSelectedEdition = isEnterprise ? magentoProductEnterpriseEdition : magentoProductCommunityEdition;
        const magentoProject = `magento/project-${magentoEdition}-edition`;

        if (await pathExists(path.join(baseConfig.magentoDir, 'composer.json'))) {
            await adjustComposerJson({
                baseConfig,
                isEnterprise,
                magentoEdition,
                magentoPackageVersion,
                magentoProductSelectedEdition,
                magentoVersion,
                task
            });
        }

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

        task.title = `Installing Magento ${magentoPackageVersion}`;
        task.output = 'Creating Magento project';

        if (!await pathExists(path.join(baseConfig.magentoDir, 'composer.json'))) {
            await createMagentoProject({
                magentoProject,
                magentoPackageVersion,
                magentoVersion,
                task
            });
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
