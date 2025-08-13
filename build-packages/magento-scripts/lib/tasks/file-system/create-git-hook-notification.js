const path = require('path')
const fs = require('fs')
const UnknownError = require('../../errors/unknown-error')
const setConfigFile = require('../../util/set-config')
const { execAsyncSpawn } = require('../../util/exec-async-command')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const createGitHookNotification = () => ({
    title: 'Setting git hook notification',
    task: async (ctx) => {
        const gitHookTemplatePath = path.join(
            ctx.config.baseConfig.templateDir,
            'git-postcheckout-hook.template'
        )

        const gitRoot = await execAsyncSpawn('git rev-parse --show-toplevel')

        let currentGitHookPath = await execAsyncSpawn(
            `git config --get core.hooksPath`
        )

        if (!currentGitHookPath.trim()) {
            await execAsyncSpawn(`git config core.hooksPath .git/hooks`)

            currentGitHookPath = '.git/hooks'
        }

        const gitHookPath = path.join(
            gitRoot,
            currentGitHookPath,
            'post-checkout'
        )

        try {
            await setConfigFile({
                configPathname: gitHookPath,
                template: gitHookTemplatePath,
                overwrite: false
            })
        } catch (e) {
            throw new UnknownError(
                `Unexpected error accrued during git hook notification creation\n\n${e}`
            )
        }

        // check if gitHookPath is executable
        const isExecutable = await fs.promises.stat(gitHookPath)
        if (isExecutable.mode & 0o111) {
            return
        }

        await execAsyncSpawn(`chmod +x ${gitHookPath}`)
    }
})

module.exports = createGitHookNotification
