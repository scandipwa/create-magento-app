const path = require('path')
const UnknownError = require('../../errors/unknown-error')
const getJsonfileData = require('../../util/get-jsonfile-data')
const runComposerCommand = require('../../util/run-composer')

/**
 * @type {(theme: import('../../../typings/theme').Theme) => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const symlinkTheme = (theme) => ({
    title: 'Setting symbolic link for theme in composer.json',
    task: async (ctx, task) => {
        const { verbose = false } = ctx
        /**
         * @type {{ require: Record<string, string>, repositories?: Record<string, { type: string, url: string }> | { type: string, url: string }[] } | null}
         */
        const composerJsonData = await getJsonfileData(
            path.join(process.cwd(), 'composer.json')
        )

        if (!composerJsonData || !composerJsonData.repositories) {
            task.skip()
            return
        }

        /**
         * @type {Record<string, { type: string, url: string }>}
         */
        const init = {}
        const repositories = Array.isArray(composerJsonData.repositories)
            ? composerJsonData.repositories.reduce(
                  (acc, repo, index) => ({ ...acc, [`${index}`]: repo }),
                  init
              )
            : composerJsonData.repositories

        if (
            Object.values(repositories).some(
                (value) => value.url === theme.themePath
            )
        ) {
            task.skip()
            return
        }

        try {
            await runComposerCommand(
                ctx,
                `config repo.scandipwa path ${theme.absoluteThemePath}`,
                {
                    callback: !verbose
                        ? undefined
                        : (t) => {
                              task.output = t
                          }
                }
            )
        } catch (e) {
            throw new UnknownError(
                `Unexpected error while configuring theme symbolic link.
                See ERROR log above.\n\n${e}`
            )
        }

        ctx.isSetupUpgradeNeeded = true
    }
})

module.exports = symlinkTheme
