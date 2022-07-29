const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const KnownError = require('../../../errors/known-error');
const { execAsyncSpawn } = require('../../../util/exec-async-command');
const openBrowser = require('../../../util/open-browser');
const installDocker = require('./install');
const installDockerOnMac = require('./install-on-mac');
const { checkDockerPerformance } = require('./performance');
const { checkDockerSocketPermissions } = require('./permissions');
const checkDockerStatus = require('./running-status');
const getDockerVersion = require('./version');

const setVersionInContextTask = (task) => ({
    task: (ctx) => {
        if (ctx.platform === 'darwin' && ctx.dockerServerData && ctx.dockerServerData.Platform && ctx.dockerServerData.Platform.Name) {
            task.title = `Using ${ctx.dockerServerData.Platform.Name} for Mac`;
        } else {
            task.title = `Using Docker version ${ctx.dockerVersion}`;
        }
    }
});

const dockerInstallPromptLinux = async (task) => {
    const automaticallyInstallDocker = await task.prompt({
        type: 'Confirm',
        message: `You don't have Docker installed!
Do you want to install it automatically?
NOTE: After installation it's recommended to log out and log back in so your group membership is re-evaluated!`
    });

    if (automaticallyInstallDocker) {
        return task.newListr([
            installDocker(),
            checkDockerSocketPermissions(),
            getDockerVersion(),
            {
                task: (ctx) => {
                    task.title = `Using docker version ${ctx.dockerVersion}`;

                    throw new KnownError(
                        `Docker is installed successfully!
Please log out and log back to so your group membership is re-evaluated!
Learn more here: ${ logger.style.link('https://docs.docker.com/engine/install/linux-postinstall/') }`
                    );
                }
            }
        ]);
    }

    throw new KnownError('Docker is not installed!');
};

// maybe in the future docker will be possible to install on wsl from terminal...
const dockerInstallPromptWindows = () => {
    throw new KnownError(
        `You don't have Docker installed!
Follow this instructions to install Docker on Windows:
${ logger.style.link('https://docs.create-magento-app.com/getting-started/prerequisites/windows-requirements#2-install-docker-desktop-for-windows') }`
    );
};

/**
 * @param {import('listr2').ListrTaskWrapper} task
 */
const dockerInstallPromptMacOS = async (task) => {
    const confirmationToInstallDocker = await task.prompt({
        type: 'Select',
        message: `You don't have Docker installed!
Would you like to install it automatically using brew cask or you prefer to install it manually?`,
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
    });

    if (confirmationToInstallDocker === 'automatic') {
        return task.newListr([
            installDockerOnMac(),
            checkDockerSocketPermissions(),
            checkDockerStatus(),
            getDockerVersion(),
            setVersionInContextTask(task)
        ]);
    }

    const dockerInstallLink = 'https://docs.create-magento-app.com/getting-started/prerequisites/installation-on-macos#3.-install-docker-for-mac';
    await openBrowser(dockerInstallLink);

    throw new KnownError(
        `Follow this instructions to install Docker on Mac:
${ logger.style.link(dockerInstallLink) }`
    );
};

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const checkDocker = () => ({
    title: 'Checking Docker',
    task: async (ctx, task) => {
        const { code } = await execAsyncSpawn('docker -v', {
            withCode: true
        });

        if (code !== 0) {
            if (ctx.platform === 'linux' && !ctx.isWsl) {
                const result = await dockerInstallPromptLinux(task);
                if (result) {
                    return result;
                }
            } else if (ctx.isWsl) {
                dockerInstallPromptWindows();
            } else {
                const result = await dockerInstallPromptMacOS(task);
                if (result) {
                    return result;
                }
            }
        }

        return task.newListr([
            checkDockerSocketPermissions(),
            checkDockerStatus(),
            getDockerVersion(),
            setVersionInContextTask(task)
        ]);
    }
});

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
module.exports = () => ({
    task: (ctx, task) => task.newListr([
        checkDocker(),
        checkDockerPerformance()
    ], {
        concurrent: false
    })
});
