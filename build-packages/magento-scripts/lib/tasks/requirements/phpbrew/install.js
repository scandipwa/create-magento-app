const os = require('os');
const path = require('path');
const fs = require('fs');
const osPlatform = require('../../../util/os-platform');
const { execAsyncSpawn } = require('../../../util/exec-async-command');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const installDependenciesTask = require('../../../util/install-dependencies-task');

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const installPHPBrewDependencies = () => ({
    title: 'Installing PHPBrew dependencies',
    task: async (ctx, task) => {
        if (os.platform() === 'darwin') {
            return task.newListr(
                installDependenciesTask({
                    platform: 'darwin',
                    dependenciesToInstall: ['php', 'autoconf', 'pkg-config']
                })
            );
        }
        const { dist } = await osPlatform();
        switch (dist) {
        case 'Arch Linux':
        case 'Manjaro Linux': {
            return task.newListr(
                installDependenciesTask({
                    platform: 'Arch Linux',
                    dependenciesToInstall: ['php', 'pkg-config']
                })
            );
        }
        case 'Fedora': {
            return task.newListr(
                installDependenciesTask({
                    platform: 'Fedora',
                    dependenciesToInstall: ['php']
                })
            );
        }
        case 'CentOS': {
            return task.newListr(
                installDependenciesTask({
                    platform: 'CentOS',
                    dependenciesToInstall: ['php']
                })
            );
        }
        case 'Linux Mint':
        case 'Ubuntu': {
            return task.newListr(
                installDependenciesTask({
                    platform: 'Ubuntu',
                    dependenciesToInstall: ['php']
                })
            );
        }
        default: {
            task.skip();
        }
        }
    }
});

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const installXcode = () => ({
    title: 'Installing XCode',
    task: async (ctx, task) => {
        const { code: XCODEInstallCode } = await execAsyncSpawn('xcode-select -p 1>/dev/null;echo $?', {
            throwNonZeroCode: false,
            withCode: true
        });

        if (XCODEInstallCode !== 0) {
            return task.newListr({
                task: async (subCtx, subTask) => {
                    await execAsyncSpawn('xcode-select --install', {
                        pipeInput: true,
                        callback: (t) => {
                            subTask.output = t;
                        }
                    });
                },
                options: {
                    bottomBar: 10
                }
            });
        }

        task.skip();
    }
});

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const installPHPBrewBinary = () => ({
    title: 'Installing PHPBrew binary',
    task: async (ctx, task) => {
        task.output = 'Downloading PHPbrew binary...';
        await execAsyncSpawn('curl -L -O https://github.com/phpbrew/phpbrew/releases/latest/download/phpbrew.phar', {
            throwNonZeroCode: true
        });

        task.output = 'Making PHPbrew binary executable...';
        await execAsyncSpawn('chmod +x phpbrew.phar', {
            throwNonZeroCode: true
        });

        task.output = 'Moving PHPbrew binary to /url/local/bin directory...';
        task.output = 'Enter your sudo password:';
        await execAsyncSpawn('sudo mv phpbrew.phar /usr/local/bin/phpbrew', {
            throwNonZeroCode: true,
            pipeInput: true
        });

        task.output = 'Initializing PHPbrew...';
        await execAsyncSpawn('phpbrew init', {
            throwNonZeroCode: true
        });
    },
    options: {
        bottomBar: 10
    }
});

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const addPHPBrewInitiatorLineToConfigFile = () => ({
    task: async (ctx, task) => {
        const shellName = process.env.SHELL.split('/').pop();

        const shellConfigFileName = `.${shellName}rc`;

        const addLineToShellConfigFIle = await task.prompt({
            type: 'Confirm',
            message: `To finish finish configuring PHPBrew we need to add ${logger.style.code('[[ -e ~/.phpbrew/bashrc ]] && source ~/.phpbrew/bashrc')} line to your ${ shellConfigFileName } file.
Do you want to do it now?`
        });

        if (!addLineToShellConfigFIle) {
            task.skip();
            return;
        }

        if (shellName === 'zsh') {
            await fs.promises.appendFile(
                path.join(os.homedir(), '.zshrc'),
                '\n[[ -e ~/.phpbrew/bashrc ]] && source ~/.phpbrew/bashrc\n'
            );
        } else if (shellName === 'bash') {
            await fs.promises.appendFile(
                path.join(os.homedir(), '.bashrc'),
                '\n[[ -e ~/.phpbrew/bashrc ]] && source ~/.phpbrew/bashrc\n'
            );
        } else {
            const continueInstall = await task.prompt({
                type: 'Confirm',
                message: `Unfortunately we cannot automatically add necessary configuration for your shell ${process.env.SHELL}!
You will need to that manually!

Add following string to your shells configuration file: ${logger.style.code('[[ -e ~/.phpbrew/bashrc ]] && source ~/.phpbrew/bashrc')}

When you ready, press select Yes and installation will continue.`
            });

            if (!continueInstall) {
                throw new Error(`Add following string to your shells configuration file: ${logger.style.code('[[ -e ~/.phpbrew/bashrc ]] && source ~/.phpbrew/bashrc')}

Then you can continue installation.`);
            }
        }
    }
});

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const installPHPBrew = () => ({
    title: 'Installing PHPBrew',
    task: async (ctx, task) => {
        const currentPlatform = os.platform();

        if (currentPlatform === 'darwin') {
            return task.newListr([
                installXcode(),
                installPHPBrewDependencies(),
                installPHPBrewBinary(),
                addPHPBrewInitiatorLineToConfigFile()
            ]);
        }

        return task.newListr([
            installPHPBrewDependencies(),
            installPHPBrewBinary(),
            addPHPBrewInitiatorLineToConfigFile()
        ]);
    }
});

module.exports = installPHPBrew;
