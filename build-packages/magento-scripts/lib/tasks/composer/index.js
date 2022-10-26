const safeRegexExtract = require('../../util/safe-regex-extract')
const UnknownError = require('../../errors/unknown-error')
const { runContainerImage } = require('../../util/run-container-image')

/**
 * @param {import('../../../typings/context').ListrContext} ctx
 * @returns {Promise<string>}
 */
const getComposerVersion = async (ctx) => {
    const { php } = ctx.config.docker.getContainers(ctx.ports)
    const composerVersionOutput = await runContainerImage(
        php.image,
        'composer --version --no-ansi'
    )

    const composerVersion = safeRegexExtract({
        string: composerVersionOutput,
        regex: /composer.+(\d+\.\d+\.\d+)/i,
        onNoMatch: () => {
            throw new UnknownError(
                `No composer version found in composer version output!\n\n${composerVersionOutput}`
            )
        }
    })

    return composerVersion
}

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const getComposerVersionTask = () => ({
    title: 'Retrieving Composer version',
    task: async (ctx, task) => {
        const composerVersion = await getComposerVersion(ctx)
        task.title = `Using Composer version ${composerVersion}`
        ctx.composerVersion = composerVersion
    },
    options: {
        bottomBar: 10
    }
})

module.exports = {
    getComposerVersionTask,
    // installPrestissimo,
    getComposerVersion
}
