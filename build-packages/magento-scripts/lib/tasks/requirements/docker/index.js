const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const os = require('os');
const KnownError = require('../../../errors/known-error');
const { execAsyncSpawn } = require('../../../util/exec-async-command');
const getIsWsl = require('../../../util/is-wsl');
const installDocker = require('./install');
const { checkDockerSocketPermissions } = require('./permissions');
const checkDockerStatus = require('./running-status');
const getDockerVersion = require('./version');

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
            const isWsl = await getIsWsl();
            if (os.platform() === 'linux' && !isWsl) {
                const automaticallyInstallDocker = await task.prompt({
                    type: 'Confirm',
                    message: `You don't have Docker installed!
Do you want to install it automatically?
NOTE: After installation it's recommended to log out and log back in so your group membership is re-evaluated!`
                });

                if (automaticallyInstallDocker) {
                    return task.newListr([
                        installDocker(),
                        getDockerVersion(),
                        {
                            task: (ctx) => {
                                task.title = `Using docker version ${ctx.dockerVersion}`;

                                throw new Error(
                                    `Docker is installed successfully!
Please log out and log back to so your group membership is re-evaluated!
Learn more here: ${ logger.style.link('https://docs.docker.com/engine/install/linux-postinstall/') }`
                                );
                            }
                        }
                    ]);
                }

                throw new KnownError('Docker is not installed!');
            } else if (isWsl) {
                throw new KnownError(
                    `You don't have Docker installed!
Follow this instructions to install Docker on Windows:
${ logger.style.link('https://docs.create-magento-app.com/getting-started/prerequisites/windows-requirements#2-install-docker-desktop-for-windows') }`
                );
            } else {
                throw new KnownError(
                    `You don't have Docker installed!
Follow this instructions to install Docker on Mac:
${ logger.style.link('https://docs.create-magento-app.com/getting-started/prerequisites/installation-on-macos#3-install-docker-for-mac') }`
                );
            }
        }

        return task.newListr([
            checkDockerStatus(),
            getDockerVersion(),
            {
                task: (ctx) => {
                    task.title = `Using Docker version ${ctx.dockerVersion}`;
                }
            }
        ]);
    }
});

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
module.exports = () => ({
    task: (ctx, task) => task.newListr([
        checkDockerSocketPermissions(),
        checkDocker()
    ], {
        concurrent: false
    })
});
