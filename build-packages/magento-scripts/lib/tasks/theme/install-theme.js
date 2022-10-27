const path = require('path')
const UnknownError = require('../../errors/unknown-error')
const getJsonfileData = require('../../util/get-jsonfile-data')
const runComposerCommand = require('../../util/run-composer')

/**
 * @type {(theme: import('../../../typings/theme').Theme) => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const installTheme = (theme) => ({
    title: 'Installing theme in composer.json',
    task: async (ctx, task) => {
        const { verbose = false } = ctx
        /**
         * @type {{ require: Record<string, string> } | null}
         */
        const composerJsonData = await getJsonfileData(
            path.join(process.cwd(), 'composer.json')
        )

        if (
            composerJsonData &&
            composerJsonData.require[theme.composerData.name]
        ) {
            task.skip()
            return
        }

        try {
            await runComposerCommand(
                ctx,
                `require ${theme.composerData.name}`,
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
                `Unexpected error while installing theme.
See ERROR log below.\n\n${e}`
            )
        }

        ctx.isSetupUpgradeNeeded = true
    },
    options: {
        bottomBar: 10
    }
})

module.exports = installTheme
