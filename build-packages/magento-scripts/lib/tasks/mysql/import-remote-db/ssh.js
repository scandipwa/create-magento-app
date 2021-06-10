/* eslint-disable new-cap */
/* eslint-disable no-param-reassign */
const os = require('os');
const { NodeSSH } = require('node-ssh');
const pathExists = require('../../../util/path-exists');
const { execAsyncSpawn } = require('../../../util/exec-async-command');

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const sshDb = {
    task: async (ctx, task) => {
        const { remoteDbUrl } = ctx;
        const {
            hostname,
            username,
            password
        } = remoteDbUrl;

        task.title = `Connecting to remote ssh server ${hostname}`;

        const ssh = new NodeSSH();

        if (!password) {
            const privateKey = await task.prompt({
                type: 'Input',
                message: `Please enter your private key location to connect to ${hostname}`,
                initial: `${os.homedir()}/.ssh/id_rsa`
            });

            if (!await pathExists(privateKey)) {
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
        task.output = 'Making remote database dump.sql...';
        await ssh.execCommand(
            'mysqldump magento --single-transaction --no-tablespaces --result-file=dump.sql'
        );

        const { stdout: remotePwd } = await ssh.execCommand('pwd');

        ssh.dispose();

        task.output = 'Downloading dump.sql file...';
        await execAsyncSpawn(
            `scp ${remoteDbUrl.href.replace(/ssh:\/\//i, '')}:${remotePwd}/dump.sql .`
        );
        // /**
        //  * @type {import('node-scp').ScpClient}
        //  */
        // let scpClient;

        // if (!password) {
        //     scpClient = await scp({
        //         host: hostname,
        //         username,
        //         privateKey: fs.readFileSync(ctx.privateKey),
        //         passphrase: ctx.passphrase,
        //     });
        // } else {
        //     scpClient = await scp({
        //         host: hostname,
        //         username,
        //         password
        //     });
        // }

        // task.output = 'Downloading dump.sql...';

        // await scpClient.downloadFile(
        //     `${remotePwd}/dump.sql`,
        //     path.resolve('dump.sql')
        // );

        // scpClient.close();
    },
    options: {
        bottomBar: 10
    }
};

module.exports = sshDb;
