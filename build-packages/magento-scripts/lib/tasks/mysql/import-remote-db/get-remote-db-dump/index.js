/* eslint-disable arrow-body-style, no-param-reassign */
const sshDb = require('./ssh');
// const mysqlDb = require('./mysql');

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const connectRemoteServer = {
    title: 'Connecting to remote server',
    task: async (ctx, task) => {
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

module.exports = connectRemoteServer;
