/* eslint-disable no-param-reassign, no-unused-vars */
const fs = require('fs');
const downloadFile = require('../../util/download-file');
const { execAsyncSpawn } = require('../../util/exec-async-command');
const pathExists = require('../../util/path-exists');
const safeRegexExtract = require('../../util/safe-regex-extract');
const installPrestissimo = require('./install-prestissimo');

const getComposerVersion = async ({ composer, php }) => {
    const composerVersionOutput = await execAsyncSpawn(`${php.binPath} -c ${php.initPath} ${composer.binPath} --version --no-ansi`);

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

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const installComposer = {
    title: 'Installing composer',
    task: async (ctx, task) => {
        const { composer, php } = ctx.config;
        const hasComposerInCache = await pathExists(composer.binPath);

        if (!hasComposerInCache) {
            task.title = 'Installing Composer';
            await createComposerDir({ composer });
            try {
                await downloadFile(`https://getcomposer.org/composer-${composer.version}.phar`, {
                    destination: composer.binPath
                });
            } catch (e) {
                throw new Error(
                    `Unexpected issue, while installing composer.
                    Please see the error log below.\n\n${e}`
                );
            }
        }

        const composerVersion = await getComposerVersion({ composer, php });
        task.title = `Using composer version ${composerVersion}`;
    }
};

module.exports = { installComposer, installPrestissimo };
