/* eslint-disable no-param-reassign */
const runComposerCommand = require('../../../util/run-composer');

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const themeSymlink = {
    title: 'Setting symbolic link for theme in composer.json',
    task: async ({ absoluteThemePath, magentoVersion }, task) => {
        try {
            await runComposerCommand(`config repo.scandipwa path ${absoluteThemePath}`, {
                magentoVersion,
                callback: (t) => {
                    task.output = t;
                }
            });
        } catch (e) {
            throw new Error(
                `Unexpected error while configuring theme symbolic link.
                See ERROR log above.\n\n${e}`
            );
        }
    }
};

module.exports = themeSymlink;
