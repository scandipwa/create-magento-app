const UnknownError = require('../../../errors/unknown-error')
const sshDb = require('./ssh')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const importRemoteDbSSH = () => ({
    skip: (ctx) => typeof ctx.remoteDb === 'undefined',
    task: async (ctx, task) => {
        task.title = 'Importing database from remote server'

        if (!ctx.remoteDb) {
            ctx.remoteDb = await task.prompt({
                type: 'Input',
                message: `Please enter a remote server connection string.
It can be a SSH (ssh://<url>) connection or mysql (mysql://<url>) connection.
`
            })
        }

        const url = new URL(ctx.remoteDb)

        ctx.remoteDbUrl = url

        const { protocol } = url

        switch (protocol) {
            case 'ssh:': {
                return task.newListr(sshDb())
            }
            default: {
                throw new UnknownError(`Unsupported protocol ${protocol}`)
            }
        }
    }
})

module.exports = importRemoteDbSSH
