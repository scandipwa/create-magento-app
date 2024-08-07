const os = require('os')
const { NodeSSH } = require('node-ssh-no-cpu-features')
const pathExists = require('../../../../util/path-exists')
const regularSSHServer = require('./regular-server')
const readymageSSH = require('./readymage')
const KnownError = require('../../../../errors/known-error')

/**
 * @returns {import('listr2').ListrTask<import('../../../../../typings/context').ListrContext>}
 */
const sshDb = () => ({
    task: async (ctx, task) => {
        const { remoteDbUrl, withCustomersData, noCompress } = ctx
        const { hostname, username, password } = remoteDbUrl

        task.title = `Importing database from remote ssh server ${hostname}`

        const ssh = new NodeSSH()
        ctx.ssh = ssh

        if (!password) {
            const privateKey = await task.prompt({
                type: 'Input',
                message: `Please enter your private key location to connect to ${hostname}\n`,
                initial: `${os.homedir()}/.ssh/id_rsa`
            })

            if (!(await pathExists(privateKey))) {
                throw new KnownError(`Private key not found: ${privateKey}`)
            }

            ctx.privateKey = privateKey

            const passphrase = await task.prompt({
                type: 'Input',
                message:
                    'Please enter your private key passphrase (if you have it)'
            })

            ctx.passphrase = passphrase || undefined

            await ssh.connect({
                host: hostname,
                username,
                privateKey,
                passphrase
            })
        } else {
            await ssh.connect({
                host: hostname,
                username,
                password
            })
        }

        ctx.importDb = './dump.sql'

        const { stdout: remoteFilesOutput } = await ssh.execCommand('ls')

        const dumpFileNames = !withCustomersData
            ? ['dump-0.sql', 'dump-1.sql']
            : ['dump.sql']

        if (!noCompress) {
            dumpFileNames.push('dump.sql.gz')
        }
        const remoteFiles = remoteFilesOutput.split('\n')

        if (dumpFileNames.every((dumpFile) => remoteFiles.includes(dumpFile))) {
            ctx.makeRemoteDumps = await task.prompt({
                type: 'Toggle',
                enabled: 'Yes!',
                disabled: 'No, just download and import them.',
                message: `We found dump files on remote server.
  Do you want to replace them with new dump files or use existing ones?
`
            })
        } else {
            ctx.makeRemoteDumps = true
        }

        if (hostname.endsWith('readymage.com')) {
            return task.newListr(readymageSSH())
        }

        return task.newListr(regularSSHServer())
    },
    options: {
        bottomBar: 10
    }
})

module.exports = sshDb
