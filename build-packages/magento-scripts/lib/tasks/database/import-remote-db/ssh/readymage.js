const mergeFiles = require('merge-files')
const { orderTables, customerTables } = require('../../magento-tables')
const { execAsyncSpawn } = require('../../../../util/exec-async-command')
const databaseDumpCommandWithOptions = require('./database-dump-command')

/**
 * @returns {import('listr2').ListrTask<import('../../../../../typings/context').ListrContext & { ssh: import('node-ssh-no-cpu-features').NodeSSH }>}
 */
const readymageSSH = () => ({
    task: async (ctx, task) => {
        const {
            ssh,
            remoteDbUrl,
            makeRemoteDumps,
            withCustomersData,
            noCompress
        } = ctx
        const sshConnectString = remoteDbUrl.href.replace(/ssh:\/\//i, '')
        if (makeRemoteDumps) {
            if (!withCustomersData) {
                task.output =
                    'Making remote database dump files without customers data...'

                const firstCommand = [
                    ...databaseDumpCommandWithOptions,
                    ...[...orderTables, ...customerTables].map(
                        (table) => `--ignore-table=magento.${table}`
                    ),
                    '--result-file=dump-0.sql'
                ].join(' ')

                /**
                 * create dump without customers and orders
                 */
                await ssh.execCommand(firstCommand)

                const secondCommand = [
                    ...databaseDumpCommandWithOptions,
                    '--no-data',
                    '--result-file=dump-1.sql',
                    ...[...orderTables, ...customerTables]
                ].join(' ')

                await ssh.execCommand(secondCommand)
            } else {
                task.output =
                    'Making remote database dump file with customers data...'

                const command = [
                    ...databaseDumpCommandWithOptions,
                    '--result-file=dump.sql'
                ].join(' ')

                await ssh.execCommand(command)
            }

            if (!noCompress) {
                task.output = 'Compressing dump files...'
                if (!withCustomersData) {
                    await ssh.execCommand(
                        'tar -czvf dump.sql.gz ./dump-0.sql ./dump-1.sql'
                    )
                } else {
                    await ssh.execCommand('tar -czvf dump.sql.gz ./dump.sql')
                }
            }
        }

        const { stdout: remotePwd } = await ssh.execCommand('pwd')

        ssh.dispose()

        if (!withCustomersData) {
            task.output = 'Downloading dump files...'
            if (noCompress) {
                await execAsyncSpawn(
                    `scp -O ${sshConnectString}:${remotePwd}/dump-0.sql .`
                )
                await execAsyncSpawn(
                    `scp -O ${sshConnectString}:${remotePwd}/dump-1.sql .`
                )
            } else {
                await execAsyncSpawn(
                    `scp -O ${sshConnectString}:${remotePwd}/dump.sql.gz .`
                )

                task.output = 'Extracting dump files...'

                await execAsyncSpawn('tar -xf ./dump.sql.gz')
            }

            await mergeFiles(['./dump-0.sql', './dump-1.sql'], './dump.sql')
        } else {
            task.output = 'Downloading dump file...'
            if (noCompress) {
                await execAsyncSpawn(
                    `scp -o StrictHostKeyChecking=no -O ${sshConnectString}:${remotePwd}/dump.sql .`
                )
            } else {
                await execAsyncSpawn(
                    `scp -o StrictHostKeyChecking=no -O ${sshConnectString}:${remotePwd}/dump.sql.gz .`
                )

                task.output = 'Extracting dump file...'

                await execAsyncSpawn('tar -xf ./dump.sql.gz')
            }
        }
    }
})

module.exports = readymageSSH
