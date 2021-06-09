/* eslint-disable arrow-body-style */
/* eslint-disable no-param-reassign */
// const { spawn } = require('child_process');
const os = require('os');
const { NodeSSH } = require('node-ssh');
const pathExists = require('../../../util/path-exists');

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const connectRemoteServerSSH = {
    title: 'Connecting to remote ssh server',
    task: async (ctx, task) => {
        const url = new URL(`ssh://${ctx.remoteDb}`);

        const {
            username,
            hostname,
            password
        } = url;

        task.title = `Connecting to remote ssh server ${hostname}`;

        const ssh = new NodeSSH();

        if (!password) {
            const privateKey = ctx.privateKey || await task.prompt({
                type: 'Input',
                message: 'Please enter your private key location',
                initial: `${os.homedir()}/.ssh/id_rsa`
            });

            if (!await pathExists(privateKey)) {
                throw new Error(`Private key not found: ${privateKey}`);
            }

            await ssh.connect({
                host: hostname,
                username,
                privateKey,
                passphrase: ctx.passphrase
            });
        } else {
            await ssh.connect({
                host: hostname,
                username,
                password
            });
        }

        ctx.sshConnection = ssh;
    }
};

module.exports = connectRemoteServerSSH;
