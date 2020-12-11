/* eslint-disable no-param-reassign */
const runComposerCommand = require('../../util/run-composer');

const prestissimoInstall = {
    title: 'Installing Prestissimo',
    task: async (ctx, task) => {
        await runComposerCommand('global require hirak/prestissimo', {
            callback: (t) => {
                task.output = t;
            }
        });
    },
    options: {
        bottomBar: 10
    }
};

module.exports = prestissimoInstall;
