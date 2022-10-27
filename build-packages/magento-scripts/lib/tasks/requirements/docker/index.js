const os = require('os')
const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const { cmaGlobalConfig } = require('../../../config/cma-config')
const KnownError = require('../../../errors/known-error')
const { execAsyncSpawn } = require('../../../util/exec-async-command')
const openBrowser = require('../../../util/open-browser')
const checkDockerDesktopContext = require('./context')
const { installDockerEngine } = require('./install')
const installDockerOnMac = require('./install-on-mac')
const { checkDockerPerformance } = require('./performance')
const { checkDockerSocketPermissions } = require('./permissions')
const {
    checkDockerStatus,
    getDockerEngineAndDesktopServiceStatus
} = require('./running-status')
const getDockerVersion = require('./version')
const getIsWsl = require('../../../util/is-wsl')

const USE_DOCKER_ENGINE_WITH_DOCKER_DESKTOP_ANSWER =
    'useDockerEngineWithDockerDesktop'

/**
 * @param {import('listr2').ListrTaskWrapper<import('../../../../typings/context').ListrContext, any>} task
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const setVersionInContextTask = (task) => ({
    task: (ctx) => {
        if (
            os.platform() === 'darwin' &&
            ctx.dockerServerData &&
            ctx.dockerServerData.Platform &&
            ctx.dockerServerData.Platform.Name
        ) {
            task.title = `Using ${ctx.dockerServerData.Platform.Name} for Mac`
        } else {
            task.title = `Using Docker version ${ctx.dockerVersion}`
        }
    }
})

/**
 * @param {import('listr2').ListrTaskWrapper<import('../../../../typings/context').ListrContext, any>} task
 * @param {{ skipPrompt?: boolean }} param1
 */
const dockerInstallPromptLinux = async (task, { skipPrompt = false } = {}) => {
    const automaticallyInstallDocker = skipPrompt
        ? 'yes'
        : await task.prompt({
              type: 'Select',
              message: `You don't have Docker installed!
Do you want to install it automatically?
`,
              choices: [
                  {
                      name: 'yes',
                      message: 'Yes, I to install Docker automatically'
                  },
                  {
                      name: 'no',
                      message: 'No, I want to install Docker myself'
                  },
                  {
                      name: 'skip',
                      message: 'Skip installing Docker'
                  }
              ]
          })

    if (automaticallyInstallDocker === 'yes') {
        return task.newListr([
            installDockerEngine(),
            checkDockerSocketPermissions(),
            getDockerVersion(),
            {
                task: async (ctx) => {
                    task.title = `Using docker version ${ctx.dockerVersion}`

                    const confirmLogOut = await task.prompt({
                        type: 'Select',
                        message: 'Docker installed successfully!\n',
                        choices: [
                            {
                                name: 'log-out',
                                message: `${logger.style.command(
                                    '[Recommended]'
                                )} Now I will log out and log back it (or restart my system) to re-evaluate group membership`
                            },
                            {
                                name: 'skip',
                                message:
                                    'Skip log out and proceed with installation'
                            }
                        ]
                    })

                    if (confirmLogOut === 'skip') {
                        return
                    }

                    throw new KnownError(
                        `Docker is installed successfully!
Please log out and log back in (or restart your system) so your group membership is re-evaluated!
Learn more here: ${logger.style.link(
                            'https://docs.docker.com/engine/install/linux-postinstall/'
                        )}`
                    )
                }
            },
            checkDockerStatus(),
            checkDockerDesktopContext()
        ])
    }

    if (automaticallyInstallDocker === 'skip') {
        return
    }

    throw new KnownError('Docker is not installed!')
}

// maybe in the future docker will be possible to install on wsl from terminal...
const dockerInstallPromptWindows = () => {
    throw new KnownError(
        `You don't have Docker installed!
Follow this instructions to install Docker on Windows:
${logger.style.link(
    'https://docs.create-magento-app.com/getting-started/prerequisites/windows-requirements#2-install-docker-desktop-for-windows'
)}`
    )
}

/**
 * @param {import('listr2').ListrTaskWrapper<import('../../../../typings/context').ListrContext, any>} task
 */
const dockerInstallPromptMacOS = async (task) => {
    const confirmationToInstallDocker = await task.prompt({
        type: 'Select',
        message: `You don't have Docker installed!
Would you like to install it automatically using brew cask or you prefer to install it manually?
`,
        choices: [
            {
                name: 'automatic',
                message: 'Install Docker using brew cask'
            },
            {
                name: 'manually',
                message: 'Install Docker manually'
            }
        ]
    })

    if (confirmationToInstallDocker === 'automatic') {
        return task.newListr([
            installDockerOnMac(),
            checkDockerSocketPermissions(),
            checkDockerStatus(),
            getDockerVersion(),
            setVersionInContextTask(task)
        ])
    }

    const dockerInstallLink =
        'https://docs.create-magento-app.com/getting-started/prerequisites/installation-on-macos#3.-install-docker-for-mac'
    await openBrowser(dockerInstallLink)

    throw new KnownError(
        `Follow this instructions to install Docker on Mac:
${logger.style.link(dockerInstallLink)}`
    )
}

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const checkDocker = () => ({
    title: 'Checking Docker',
    task: async (ctx, task) => {
        const { code } = await execAsyncSpawn('docker -v', {
            withCode: true
        })

        if (code !== 0) {
            if (os.platform() === 'linux') {
                const isWsl = await getIsWsl()
                if (!isWsl) {
                    const { engine } =
                        await getDockerEngineAndDesktopServiceStatus()
                    if (!engine.exists) {
                        const result = await dockerInstallPromptLinux(task)
                        if (result) {
                            return result
                        }
                    }
                } else if (isWsl) {
                    dockerInstallPromptWindows()
                }
            } else {
                const result = await dockerInstallPromptMacOS(task)
                if (result) {
                    return result
                }
            }
        } else if (os.platform() === 'linux') {
            const { engine, desktop } =
                await getDockerEngineAndDesktopServiceStatus()
            if (
                !engine.exists &&
                desktop.exists &&
                cmaGlobalConfig.get(
                    USE_DOCKER_ENGINE_WITH_DOCKER_DESKTOP_ANSWER
                ) !== false
            ) {
                const confirmInstallingDockerEngine = await task.prompt({
                    type: 'Select',
                    message: `Looks like you have Docker Desktop installed on Linux system, but Docker Engine is not installed.
Do you want to install it and use it's context together with Docker Desktop?
`,
                    choices: [
                        {
                            name: 'yes',
                            message:
                                'Sure, if it means I will have less issues with my setup!'
                        },
                        {
                            name: 'no',
                            message: 'No. But you can ask me again later.'
                        },
                        {
                            name: 'skip',
                            message: "No. And don't ask me again."
                        }
                    ]
                })

                if (confirmInstallingDockerEngine === 'skip') {
                    cmaGlobalConfig.set(
                        USE_DOCKER_ENGINE_WITH_DOCKER_DESKTOP_ANSWER,
                        false
                    )
                } else if (confirmInstallingDockerEngine === 'yes') {
                    const result = await dockerInstallPromptLinux(task, {
                        skipPrompt: true
                    })

                    if (result) {
                        return result
                    }
                }
            }
        }

        return task.newListr([
            checkDockerSocketPermissions(),
            checkDockerStatus(),
            getDockerVersion(),
            checkDockerDesktopContext(),
            setVersionInContextTask(task)
        ])
    }
})

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
module.exports = () => ({
    task: (ctx, task) =>
        task.newListr([checkDocker(), checkDockerPerformance()], {
            concurrent: false
        })
})
