/* eslint-disable no-param-reassign */

const { execAsyncSpawn } = require('../../../util/exec-async-command');

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext & { sshConnection: import('node-ssh').NodeSSH}>}
 */
const getRemoteDbDump = {
    title: 'Getting remote database dump',
    task: async (ctx, task) => {
        ctx.importDb = './dump.sql';
        task.output = 'Making remote database dump.sql...';
        await ctx.sshConnection.execCommand(
            'mysqldump magento --single-transaction --no-tablespaces --result-file=dump.sql'
        );

        task.output = 'Downloading remote database dump into ./dump.sql';
        // await ctx.sshConnection.getFile(
        //     './dump.sql',
        //     '$HOME/dump.sql'
        // );

        const { stdout: remotePwd } = await ctx.sshConnection.execCommand('pwd');

        await execAsyncSpawn(
            `scp ${ctx.remoteDb}:${remotePwd}/dump.sql .`,
            {
                callback: (t) => {
                    task.output = t;
                }
            }
        );

        // done
    },
    options: {
        bottomBar: 10
    }
};

module.exports = getRemoteDbDump;
