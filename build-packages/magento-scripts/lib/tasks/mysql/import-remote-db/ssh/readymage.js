/* eslint-disable no-param-reassign */
const mergeFiles = require('merge-files');
const { orderTables, customerTables } = require('../../magento-tables');
const { execAsyncSpawn } = require('../../../../util/exec-async-command');
/**
 * @type {import('listr2').ListrTask<import('../../../../../typings/context').ListrContext & { ssh: import('node-ssh').NodeSSH }>}
 */
const readymageSSH = {
    task: async (ctx, task) => {
        const { ssh, remoteDbUrl } = ctx;
        const sshConnectString = remoteDbUrl.href.replace(/ssh:\/\//i, '');
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
    }
};

module.exports = readymageSSH;
