/* eslint-disable no-constant-condition,no-await-in-loop,no-param-reassign */
const mergeFiles = require('merge-files');
const { orderTables, customerTables } = require('../../magento-tables');
const { execAsyncSpawn } = require('../../../../util/exec-async-command');
/**
 * @type {import('listr2').ListrTask<import('../../../../../typings/context').ListrContext & { ssh: import('node-ssh').NodeSSH }>}
 */
const regularSSHServer = {
    task: async (ctx, task) => {
        const { ssh, remoteDbUrl, makeRemoteDumps } = ctx;
        const sshConnectString = remoteDbUrl.href.replace(/ssh:\/\//i, '');
        if (makeRemoteDumps) {
            /**
             * @type {string}
             */
            const dumpCommand = await task.prompt({
                type: 'Input',
                message: `Edit (if needed) command to connect to remote mysql server and create dump files.
Do not enter "--result-file" option, we need to control that part.

(documentation reference available here: https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html)
`,
                initial: 'mysqldump magento --single-transaction --no-tablespaces'
            });

            if (dumpCommand.includes('--result-file')) {
                throw new Error('--result-file option is not allowed in user input command');
            }

            task.output = 'Making remote database dump files...';

            const ignoredOrderAndCustomerTables = [
                ...orderTables,
                ...customerTables
            ].map((table) => `--ignore-table=magento.${table}`).join(' ');

            const includedOrdersAndCustomerTables = [
                ...orderTables,
                ...customerTables
            ].join(' ');

            /**
         * create dump without customers and orders
         */
            await ssh.execCommand(
                `${dumpCommand} ${ ignoredOrderAndCustomerTables } --result-file=dump-0.sql`
            );

            await ssh.execCommand(
                `${dumpCommand} --no-data ${ includedOrdersAndCustomerTables } --result-file=dump-1.sql`
            );
        }

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
    }
};

module.exports = regularSSHServer;
