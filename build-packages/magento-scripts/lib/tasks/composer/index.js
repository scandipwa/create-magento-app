/* eslint-disable no-param-reassign */
const fs = require('fs');
const downloadFile = require('../../util/download-file');
const { execAsyncSpawn } = require('../../util/exec-async-command');
const pathExists = require('../../util/path-exists');
const installPrestissimo = require('./install-prestissimo');

const getComposerVersion = async ({ composer, php }) => {
    const composerVersionOutput = await execAsyncSpawn(`${php.binPath} -c ${php.initPath} ${composer.binPath} --version --no-ansi`);
    const composerVersion = composerVersionOutput.match(/Composer version ([\d.]+)/i)[1];
    return composerVersion;
};

const createComposerDir = async ({ composer }) => {
    const dirExists = await pathExists(composer.dirPath);
    if (!dirExists) {
        await fs.promises.mkdir(composer.dirPath, { recursive: true });
    }
};

const installComposer = {
    title: 'Installing composer',
    task: async (ctx, task) => {
        const { composer, php } = ctx.config;
        const hasComposerInCache = await pathExists(composer.binPath);

        if (!hasComposerInCache) {
            task.title = 'Installing Composer';
            await createComposerDir({ composer });
            try {
                await downloadFile('https://getcomposer.org/composer-1.phar', {
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
