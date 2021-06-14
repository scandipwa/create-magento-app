/* eslint-disable no-restricted-syntax,no-await-in-loop,new-cap,no-param-reassign */
const os = require('os');
const { NodeSSH } = require('node-ssh');
const mergeFiles = require('merge-files');
const pathExists = require('../../../util/path-exists');
const { execAsyncSpawn } = require('../../../util/exec-async-command');
const { orderTables, customerTables } = require('../magento-tables');

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const sshDb = {
    task: async (ctx, task) => {
        const { remoteDbUrl } = ctx;
        const { hostname, username, password } = remoteDbUrl;
        const sshConnectString = remoteDbUrl.href.replace(/ssh:\/\//i, '');

        if (hostname !== 'ssh.readymage.com') {
            throw new Error(
                `Unfortunately, your host is not supported yet.
At the moment, only remote-db import from https://readymage.com is supported.`
            );
        }

        task.title = `Importing database from remote ssh server ${hostname}`;

        const ssh = new NodeSSH();

        if (!password) {
            const privateKey = await task.prompt({
                type: 'Input',
                message: `Please enter your private key location to connect to ${hostname}`,
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
        task.output = 'Making remote database dump files...';
        const ignoredOrderAndCustomerTables = [...orderTables, ...customerTables].map((table) => `--ignore-table=magento.${table}`).join(' ');

        /**
         * create dump without customers and orders
         */
        await ssh.execCommand(
            `mysqldump magento --single-transaction --no-tablespaces ${ ignoredOrderAndCustomerTables } --result-file=dump-0.sql`
        );

        const includedOrdersAndCustomerTables = [...orderTables, ...customerTables].join(' ');

        await ssh.execCommand(
            `mysqldump magento --single-transaction --no-tablespaces --no-data --result-file=dump-1.sql ${ includedOrdersAndCustomerTables }`
        );

        const { stdout: remotePwd } = await ssh.execCommand('pwd');

        ssh.dispose();

        task.output = 'Downloading dump files...';
        await execAsyncSpawn(
            `scp ${sshConnectString}:${remotePwd}/dump-0.sql .`
        );
        await execAsyncSpawn(
            `scp ${sshConnectString}:${remotePwd}/dump-1.sql .`
        );

        await mergeFiles(['./dump-0.sql', './dump-1.sql'], './dump.sql');
    },
    options: {
        bottomBar: 10
    }
};

module.exports = sshDb;
