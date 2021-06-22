/* eslint-disable max-len */
/* eslint-disable no-param-reassign */
const mergeFiles = require('merge-files');
const { orderTables, customerTables } = require('../../magento-tables');
const { execAsyncSpawn } = require('../../../../util/exec-async-command');
/**
 * @type {import('listr2').ListrTask<import('../../../../../typings/context').ListrContext & { ssh: import('node-ssh').NodeSSH }>}
 */
const readymageSSH = {
    task: async (ctx, task) => {
        const {
            ssh,
            remoteDbUrl,
            makeRemoteDumps,
            withCustomersData
        } = ctx;
        const sshConnectString = remoteDbUrl.href.replace(/ssh:\/\//i, '');
        if (makeRemoteDumps) {
            if (!withCustomersData) {
                task.output = 'Making remote database dump files without customers data...';
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
            } else {
                task.output = 'Making remote database dump file with customers data...';
                await ssh.execCommand(
                    'mysqldump magento --single-transaction --no-tablespaces --result-file=dump.sql'
                );
            }
        }

        const { stdout: remotePwd } = await ssh.execCommand('pwd');

        ssh.dispose();

        if (!withCustomersData) {
            task.output = 'Downloading dump files...';
            await execAsyncSpawn(
                `scp ${sshConnectString}:${remotePwd}/dump-0.sql .`
            );
            await execAsyncSpawn(
                `scp ${sshConnectString}:${remotePwd}/dump-1.sql .`
            );

            await mergeFiles(['./dump-0.sql', './dump-1.sql'], './dump.sql');
        } else {
            task.output = 'Downloading dump file...';
            await execAsyncSpawn(
                `scp ${sshConnectString}:${remotePwd}/dump.sql .`
            );
        }
    }
};

module.exports = readymageSSH;
