/* eslint-disable no-param-reassign */
const runComposerCommand = require('../../../util/run-composer');

const installTheme = {
    title: 'Installing theme',
    task: async ({ composerData, magentoVersion }, task) => {
        try {
            await runComposerCommand(`require ${composerData.name}`, {
                magentoVersion,
                callback: (t) => {
                    task.output = t;
                }
            });
        } catch (e) {
            throw new Error(
                `Unexpected error while installing theme.
                See ERROR log below.\n\n${e}`
            );
        }
    },
    options: {
        bottomBar: 10
    }
};

module.exports = installTheme;
