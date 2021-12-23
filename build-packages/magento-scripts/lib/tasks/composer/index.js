const fs = require('fs');
const semver = require('semver');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const downloadFile = require('../../util/download-file');
const { execAsyncSpawn } = require('../../util/exec-async-command');
const pathExists = require('../../util/path-exists');
const safeRegexExtract = require('../../util/safe-regex-extract');
const installPrestissimo = require('./install-prestissimo');

/**
 * @returns {Promise<string>}
 */
const getComposerVersion = async ({ composer, php }) => {
    const composerVersionOutput = await execAsyncSpawn(`${php.binPath} -c ${php.iniPath} ${composer.binPath} --version --no-ansi`);

    const composerVersion = safeRegexExtract({
        string: composerVersionOutput,
        regex: /Composer version ([\d.]+)/i,
        onNoMatch: () => {
            throw new Error(`No composer version found in composer version output!\n\n${composerVersionOutput}`);
        }
    });

    return composerVersion;
};

const createComposerDir = async ({ composer }) => {
    const dirExists = await pathExists(composer.dirPath);
    if (!dirExists) {
        await fs.promises.mkdir(composer.dirPath, { recursive: true });
    }
};

const downloadComposerBinary = async ({ composer }) => {
    const composerVersion = /^\d$/.test(composer.version)
        ? `latest-${composer.version}.x`
        : composer.version;

    try {
        await downloadFile(`https://getcomposer.org/download/${composerVersion}/composer.phar`, {
            destination: composer.binPath
        });
    } catch (e) {
        throw new Error(
            `Unexpected issue, while installing composer.
            Please see the error log below.\n\n${e}`
        );
    }
};

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const installComposer = () => ({
    title: 'Installing Composer',
    task: async (ctx, task) => {
        const { composer, php } = ctx.config;
        const hasComposerInCache = await pathExists(composer.binPath);

        if (!hasComposerInCache) {
            task.title = 'Installing Composer';
            await createComposerDir({ composer });
            await downloadComposerBinary({ composer });
        } else {
            const currentComposerVersion = await getComposerVersion({ composer, php });

            if (!semver.satisfies(currentComposerVersion, `${composer.version}.x`)) {
                const continueComposerBinaryVersionSwitch = await task.prompt({
                    type: 'Select',
                    message: `You have Composer ${logger.style.misc(`${currentComposerVersion}`)} while your Magento version requires ${logger.style.misc(`${composer.version}.x`)}!`,
                    choices: [
                        {
                            message: `Continue with current installed version (${logger.style.misc(`${currentComposerVersion}`)})`,
                            name: 'continue'
                        },
                        {
                            message: 'Install correct version and continue (you will probably have to fix composer dependencies versions)',
                            name: 'install-and-continue'
                        },
                        {
                            message: 'Exit installation.',
                            name: 'exit'
                        }
                    ]
                });

                switch (continueComposerBinaryVersionSwitch) {
                case 'install-and-continue': {
                    await downloadComposerBinary({ composer });
                    break;
                }
                case 'exit': {
                    throw new Error(`Current composer version ${logger.style.misc(`v${currentComposerVersion}`)} is not compatible with version ${logger.style.misc(`${composer.version}.x`)}!`);
                }
                case 'continue':
                default: {
                    ctx.continueWithExistingComposerVersion = true;
                    break;
                }
                }
            }
        }

        const composerVersion = await getComposerVersion({ composer, php });
        task.title = `Using Composer version ${composerVersion}`;
        ctx.composerVersion = composerVersion;
    },
    options: {
        bottomBar: 10
    }
});

module.exports = { installComposer, installPrestissimo, getComposerVersion };
