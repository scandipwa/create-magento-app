const UnknownError = require('../../../errors/unknown-error')
const { version } = require('../../docker/api')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const getDockerVersion = () => ({
    task: async (ctx) => {
        const dockerVersion = await version({
            formatToJSON: true
        })

        if (dockerVersion) {
            ctx.dockerServerData = dockerVersion.Server
            ctx.dockerClientData = dockerVersion.Client
            ctx.dockerVersion = dockerVersion.Server.Version
            ctx.isDockerDesktop =
                dockerVersion.Server.Platform.Name.includes('Desktop') ||
                dockerVersion.Client.Os === 'darwin'
        } else {
            throw new UnknownError(
                `Got unexpected result during Docker version retrieval!\n\n${dockerVersion}`
            )
        }
    }
})

module.exports = getDockerVersion
