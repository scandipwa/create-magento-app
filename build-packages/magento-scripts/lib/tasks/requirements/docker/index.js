/* eslint-disable consistent-return,no-param-reassign,no-unused-vars */
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const os = require('os');
const { execAsyncSpawn } = require('../../../util/exec-async-command');
const getIsWsl = require('../../../util/is-wsl');
const installDocker = require('./install-docker');
const getDockerVersion = require('./version');

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const checkDocker = {
    title: 'Checking docker',
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
Do you want to install it automatically?`
                });

                if (automaticallyInstallDocker) {
                    return task.newListr([
                        installDocker,
                        getDockerVersion,
                        {
                            task: (ctx) => {
                                task.title = `Using docker version ${ctx.dockerVersion}`;
                            }
                        }
                    ]);
                }

                throw new Error('Docker is not installed!');
            } else if (isWsl) {
                throw new Error(
                    `You don't have Docker installed!
Follow this instructions to install Docker on Windows:
${ logger.style.link('https://docs.create-magento-app.com/getting-started/prerequisites/windows-requirements#2-install-docker-desktop-for-windows') }`
                );
            } else {
                throw new Error(
                    `You don't have Docker installed!
Follow this instructions to install Docker on Mac:
${ logger.style.link('https://docs.create-magento-app.com/getting-started/prerequisites/installation-on-macos#3-install-docker-for-mac') }`
                );
            }
        }

        return task.newListr([
            getDockerVersion,
            {
                task: (ctx) => {
                    task.title = `Using docker version ${ctx.dockerVersion}`;
                }
            }
        ]);
    }
};

module.exports = checkDocker;
