const path = require('path')
const fs = require('fs')
const UnknownError = require('../../errors/unknown-error')
const { execAsyncSpawn } = require('../../util/exec-async-command')
const pathExists = require('../../util/path-exists')

/**
 * @param {string} p
 */
function isExec(p) {
    try {
        fs.accessSync(p, fs.constants.X_OK)
        return true
    } catch (e) {
        return false
    }
}

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const createGitHookNotification = () => ({
    title: 'Setting Git Hook Notification',
    task: async (ctx, task) => {
        const gitHookTemplatePath = path.join(
            ctx.config.baseConfig.templateDir,
            'git-postcheckout-hook.template'
        )

        const [gitRootResult, currentGitHookPathResult] = await Promise.all([
            execAsyncSpawn('git rev-parse --show-toplevel', {
                withCode: true
            }),
            execAsyncSpawn(`git config --get core.hooksPath`, {
                withCode: true
            })
        ])

        if (currentGitHookPathResult.code !== 0) {
            throw new UnknownError(
                `Unexpected error accrued during git hook notification creation\n\n${currentGitHookPathResult.result}`
            )
        }

        if (gitRootResult.code !== 0) {
            throw new UnknownError(
                `Unexpected error accrued during git hook notification creation\n\n${gitRootResult.result}`
            )
        }

        const tasks = []

        if (!currentGitHookPathResult.result.trim()) {
            tasks.push({
                title: 'Setting Git Hook Path',
                task: async () => {
                    const { code } = await execAsyncSpawn(
                        `git config core.hooksPath .git/hooks`,
                        {
                            withCode: true
                        }
                    )

                    if (code !== 0) {
                        throw new UnknownError(
                            `Unexpected error accrued during git hook notification creation\n\n${code}`
                        )
                    }

                    currentGitHookPathResult.result = '.git/hooks'
                }
            })
        }

        const gitHookPath = path.join(
            gitRootResult.result,
            currentGitHookPathResult.result.trim(),
            'post-checkout'
        )

        if (!(await pathExists(gitHookPath))) {
            tasks.push({
                title: 'Copying Git Hook Template',
                task: async () => {
                    await fs.promises.cp(gitHookTemplatePath, gitHookPath)
                }
            })
        }

        // check if gitHookPath is executable
        const isExecutable = isExec(gitHookPath)
        if (!isExecutable) {
            tasks.push({
                title: 'Making Git Hook Executable',
                task: async () => {
                    await execAsyncSpawn(`chmod +x ${gitHookPath}`, {
                        withCode: true
                    })
                }
            })
        }

        if (tasks.length > 0) {
            return task.newListr(tasks)
        }

        task.skip()
    },
    exitOnError: false
})

module.exports = createGitHookNotification
