const path = require('path');
const getJsonfileData = require('../../util/get-jsonfile-data');
const runComposerCommand = require('../../util/run-composer');

/**
 * @type {(theme: import('../../../typings/theme').Theme) => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const symlinkTheme = (theme) => ({
    title: 'Setting symbolic link for theme in composer.json',
    task: async (ctx, task) => {
        const { magentoVersion, verbose = false } = ctx;
        const composerJsonData = await getJsonfileData(path.join(process.cwd(), 'composer.json'));
        const repositories = Array.isArray(composerJsonData.repositories)
            ? composerJsonData.repositories.reduce((acc, repo, index) => ({ ...acc, [`${index}`]: repo }), {})
            : composerJsonData.repositories;

        if (Object.values(repositories).some((value) => value.url === theme.themePath)) {
            task.skip();
            return;
        }

        try {
            await runComposerCommand(`config repo.scandipwa path ${theme.absoluteThemePath}`, {
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

        ctx.isSetupUpgradeNeeded = true;
    }
});

module.exports = symlinkTheme;
