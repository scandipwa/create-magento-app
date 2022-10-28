const os = require('os')
const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const sleep = require('./sleep')
const { execCommandTask } = require('./exec-async-command')
const dependenciesForPlatforms = require('../config/dependencies-for-platforms')
const KnownError = require('../errors/known-error')

/**
 * Install dependencies
 * @param {object} options
 * @param {keyof dependenciesForPlatforms} options.platform Platform
 * @param {string[]} options.dependenciesToInstall List of dependencies to install
 * @param {boolean} [options.useMacNativeEnvironment] Use Mac native environment
 * @returns {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const installDependenciesTask = (options) => ({
    task: async (ctx, task) => {
        const { dependenciesToInstall, platform } = options
        task.title = `Installing ${platform} dependencies`
        let cmd
        if (os.platform() === 'darwin') {
            cmd = dependenciesForPlatforms[platform].installCommand(
                dependenciesToInstall.join(' '),
                {
                    native: options.useMacNativeEnvironment
                }
            )
        } else {
            cmd = dependenciesForPlatforms[platform].installCommand(
                dependenciesToInstall.join(' ')
            )
        }
        const installCommand = logger.style.code(cmd)
        const dependenciesWordFormatter = `dependenc${
            dependenciesToInstall.length > 1 ? 'ies' : 'y'
        }`
        task.title = `Installing missing dependencies: ${logger.style.code(
            dependenciesToInstall.join(', ')
        )}`
        task.output = `Missing ${dependenciesWordFormatter} ${logger.style.code(
            dependenciesToInstall.join(' ')
        )} detected!`

        let promptSkipper = false
        const timer = async () => {
            for (let i = 5 * 60; i !== 0; i--) {
                await sleep(1000)
                if (promptSkipper) {
                    return null
                }
                task.title = `Checking ${platform} dependencies (${i} sec left...)`
            }
            task.cancelPrompt()
            return 'timeout'
        }

        const installAnswer = await Promise.race([
            task.prompt({
                type: 'Select',
                message: `Do you want to install missing ${dependenciesWordFormatter} now?`,
                name: 'installAnswer',
                choices: [
                    {
                        name: 'install',
                        message: `Install ${dependenciesWordFormatter} now!`
                    },
                    {
                        name: 'not-install',
                        message: `Install ${dependenciesWordFormatter} later, when I feel it.`
                    }
                ]
            }),
            timer()
        ])

        promptSkipper = true

        if (installAnswer === 'timeout') {
            throw new KnownError(`Timeout!

To install missing ${dependenciesWordFormatter} manually, run the following command: ${installCommand}`)
        }

        if (installAnswer === 'not-install') {
            task.skip(
                `User chose to skip installation of ${dependenciesWordFormatter}`
            )
            return
        }

        if (installAnswer === 'install') {
            // on macos we don't need sudo permissions to install dependencies, so every other platform required to do that
            if (platform !== 'darwin') {
                task.output = `Enter your sudo password! It's needed for ${dependenciesWordFormatter} installation.`
                task.output = logger.style.command(
                    `>[sudo] password for ${os.userInfo().username}:`
                )
            }

            return task.newListr(
                execCommandTask(cmd, {
                    pipeInput: true
                })
            )
        }
    },
    options: {
        bottomBar: 10
    }
})

module.exports = installDependenciesTask
