/* eslint-disable consistent-return */
const os = require('os');
const path = require('path');
const fs = require('fs');
const osPlatform = require('../../../util/os-platform');
const { execCommandTask } = require('../../util/exec-async-command');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const dependenciesForPlatforms = require('../../config/dependencies-for-platforms');

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const installPHPDependency = {
    title: 'Installing PHP',
    task: async (ctx, task) => {
        const { dist } = await osPlatform();
        switch (dist) {
        case 'Arch Linux':
        case 'Manjaro Linux': {
            return task.newListr(
                execCommandTask(dependenciesForPlatforms['Arch Linux'].installCommand('php pkg-config'), {
                    pipeInput: true
                })
            );
        }
        case 'Fedora': {
            return task.newListr(
                execCommandTask(dependenciesForPlatforms.Fedora.installCommand('php'), {
                    pipeInput: true
                })
            );
        }
        case 'CentOS': {
            return task.newListr(
                execCommandTask(dependenciesForPlatforms.CentOS.installCommand('php'), {
                    pipeInput: true
                })
            );
        }
        case 'Linux Mint':
        case 'Ubuntu': {
            return task.newListr(
                execCommandTask(dependenciesForPlatforms.Ubuntu.installCommand('php'), {
                    pipeInput: true
                })
            );
        }
        default: {
            task.skip();
        }
        }
    }
};

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const installPhpbrew = {
    title: 'Installing PHPBrew',
    task: async (ctx, task) => {
        const currentPlatform = os.platform();

        if (currentPlatform === 'darwin') {
            return task.newListr([
                execCommandTask('xcode-select --install', {
                    pipeInput: true
                }),
                execCommandTask('brew install autoconf pkg-config', {
                    pipeInput: true
                }),
                execCommandTask('curl -L -O https://github.com/phpbrew/phpbrew/releases/latest/download/phpbrew.phar'),
                execCommandTask('chmod +x phpbrew.phar', {
                    pipeInput: true
                }),
                execCommandTask('sudo mv phpbrew.phar /usr/local/bin/phpbrew', {
                    pipeInput: true
                }),
                execCommandTask('phpbrew init'),
                {
                    task: async (subCtx, subTask) => {
                        const addLineToShellConfigFIle = await subTask.prompt({
                            type: 'Confirm',
                            message: `To finish finish configuring PHPBrew we need to add ${logger.style.code('source ~/.phpbrew/bashrc')} line to your .zshrc file.
Do you want to do it now?`
                        });

                        if (!addLineToShellConfigFIle) {
                            throw new Error(`Add following string to your shells configuration file: ${logger.style.code('source ~/.phpbrew/bashrc')}

Then you can continue installation.`);
                        }

                        if (process.env.SHELL.includes('zsh')) {
                            await fs.promises.appendFile(
                                path.join(os.homedir(), '.zshrc'),
                                'source ~/.phpbrew/bashrc'
                            );
                        } else if (process.env.SHELL.includes('bash')) {
                            await fs.promises.appendFile(
                                path.join(os.homedir(), '.zshrc'),
                                'source ~/.phpbrew/bashrc'
                            );
                        } else {
                            const continueInstall = await subTask.prompt({
                                type: 'Confirm',
                                message: `Unfortunately we cannot automatically add necessary configuration for your shell ${process.env.SHELL}!
You will need to that manually!

Add following string to your shells configuration file: ${logger.style.code('source ~/.phpbrew/bashrc')}

When you ready, press select Yes and installation will continue.`
                            });

                            if (!continueInstall) {
                                throw new Error(`Add following string to your shells configuration file: ${logger.style.code('source ~/.phpbrew/bashrc')}

Then you can continue installation.`);
                            }
                        }
                    }
                }
            ]);
        }

        return task.newListr([
            installPHPDependency,
            execCommandTask('curl -L -O https://github.com/phpbrew/phpbrew/releases/latest/download/phpbrew.phar'),
            execCommandTask('chmod +x phpbrew.phar'),
            execCommandTask('sudo mv phpbrew.phar /usr/local/bin/phpbrew', {
                pipeInput: true
            }),
            execCommandTask('phpbrew init')
        ]);
    }
};

module.exports = installPhpbrew;
