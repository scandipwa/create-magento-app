const safeRegexExtract = require('../../util/safe-regex-extract');
// const installPrestissimo = require('./install-prestissimo');
const UnknownError = require('../../errors/unknown-error');
const { runPHPContainerCommand } = require('../php/run-php-container');

/**
 * @param {import('../../../typings/context').ListrContext} ctx
 * @returns {Promise<string>}
 */
const getComposerVersion = async (ctx) => {
    const composerVersionOutput = await runPHPContainerCommand(ctx, 'composer --version --no-ansi');

    const composerVersion = safeRegexExtract({
        string: composerVersionOutput,
        regex: /composer.+(\d+\.\d+\.\d+)/i,
        onNoMatch: () => {
            throw new UnknownError(`No composer version found in composer version output!\n\n${composerVersionOutput}`);
        }
    });

    return composerVersion;
};

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const getComposerVersionTask = () => ({
    title: 'Retrieving Composer version',
    task: async (ctx, task) => {
        const composerVersion = await getComposerVersion(ctx);
        task.title = `Using Composer version ${composerVersion}`;
        ctx.composerVersion = composerVersion;
    },
    options: {
        bottomBar: 10
    }
});

module.exports = {
    getComposerVersionTask,
    // installPrestissimo,
    getComposerVersion
};
