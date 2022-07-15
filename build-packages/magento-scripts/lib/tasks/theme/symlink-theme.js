const path = require('path');
const UnknownError = require('../../errors/unknown-error');
const getJsonfileData = require('../../util/get-jsonfile-data');
const { runPHPContainerCommand } = require('../php/run-php-container');

/**
 * @type {(theme: import('../../../typings/theme').Theme) => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const symlinkTheme = (theme) => ({
    title: 'Setting symbolic link for theme in composer.json',
    task: async (ctx, task) => {
        const { verbose = false } = ctx;
        const composerJsonData = await getJsonfileData(path.join(process.cwd(), 'composer.json'));

        if (!composerJsonData.repositories) {
            task.skip();
            return;
        }

        const repositories = Array.isArray(composerJsonData.repositories)
            ? composerJsonData.repositories.reduce((acc, repo, index) => ({ ...acc, [`${index}`]: repo }), {})
            : composerJsonData.repositories;

        if (Object.values(repositories).some((value) => value.url === theme.themePath)) {
            task.skip();
            return;
        }

        try {
            await runPHPContainerCommand(ctx, `composer config repo.scandipwa path ${theme.absoluteThemePath}`, {
                callback: !verbose ? undefined : (t) => {
                    task.output = t;
                }
            });
        } catch (e) {
            throw new UnknownError(
                `Unexpected error while configuring theme symbolic link.
                See ERROR log above.\n\n${e}`
            );
        }

        ctx.isSetupUpgradeNeeded = true;
    }
});

module.exports = symlinkTheme;
