/* eslint-disable no-param-reassign */
const runComposerCommand = require('../../util/run-composer');

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const prestissimoInstall = {
    title: 'Installing Prestissimo',
    task: async (ctx, task) => {
        const { code } = await runComposerCommand('global show hirak/prestissimo', {
            throwNonZeroCode: false
        });

        if (code === 0) {
            task.skip();
            return;
        }

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
