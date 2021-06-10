/* eslint-disable no-param-reassign */

const getRemoteDbDump = require('./get-remote-db-dump');

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const importRemoteDbSSH = {
    skip: (ctx) => !ctx.remoteDb,
    task: async (ctx, task) => {
        task.title = 'Importing database from remote server';

        return task.newListr([
            getRemoteDbDump
        ]);
    }
};

module.exports = importRemoteDbSSH;
