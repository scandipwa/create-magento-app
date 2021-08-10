const runComposerCommand = require('../../util/run-composer');

/**
 * @type {(theme: import('../../../typings/theme').Theme) => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const symlinkTheme = ({ absoluteThemePath }) => ({
    title: 'Setting symbolic link for theme in composer.json',
    task: async ({ magentoVersion, verbose = false }, task) => {
        try {
            await runComposerCommand(`config repo.scandipwa path ${absoluteThemePath}`, {
                magentoVersion,
                callback: !verbose ? undefined : (t) => {
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
});

module.exports = symlinkTheme;
