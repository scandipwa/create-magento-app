/* eslint-disable no-param-reassign */
const os = require('os');
const { NodeSSH } = require('node-ssh');
const pathExists = require('../../../../util/path-exists');
const regularSSHServer = require('./regular-server');
const readymageSSH = require('./readymage');

/**
 * @type {import('listr2').ListrTask<import('../../../../../typings/context').ListrContext>}
 */
const sshDb = {
    task: async (ctx, task) => {
        const { remoteDbUrl } = ctx;
        const { hostname, username, password } = remoteDbUrl;

        task.title = `Importing database from remote ssh server ${hostname}`;

        const ssh = new NodeSSH();
        ctx.ssh = ssh;

        if (!password) {
            const privateKey = await task.prompt({
                type: 'Input',
                message: `Please enter your private key location to connect to ${hostname}\n`,
                initial: `${os.homedir()}/.ssh/id_rsa`
            });

            if (!(await pathExists(privateKey))) {
                throw new Error(`Private key not found: ${privateKey}`);
            }

            ctx.privateKey = privateKey;

            const passphrase = await task.prompt({
                type: 'Input',
                message: 'Please enter your private key passphrase (if you have it)'
            });

            ctx.passphrase = passphrase || undefined;

            await ssh.connect({
                host: hostname,
                username,
                privateKey,
                passphrase
            });
        } else {
            await ssh.connect({
                host: hostname,
                username,
                password
            });
        }

        ctx.importDb = './dump.sql';

        if (hostname === 'ssh.readymage.com') {
            return task.newListr([
                readymageSSH
            ]);
        }

        return task.newListr([
            regularSSHServer
        ]);
    },
    options: {
        bottomBar: 10
    }
};

module.exports = sshDb;
