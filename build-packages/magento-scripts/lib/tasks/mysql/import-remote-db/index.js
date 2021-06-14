/* eslint-disable no-param-reassign */

const sshDb = require('./ssh');

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const importRemoteDbSSH = {
    skip: (ctx) => !ctx.remoteDb,
    task: async (ctx, task) => {
        task.title = 'Importing database from remote server';

        const url = new URL(ctx.remoteDb);

        ctx.remoteDbUrl = url;

        const { protocol } = url;

        switch (protocol) {
        case 'ssh:': {
            return task.newListr([
                sshDb
            ]);
        }
        default: {
            throw new Error(`Unsupported protocol ${protocol}`);
        }
        }
    }
};

module.exports = importRemoteDbSSH;
