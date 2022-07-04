const os = require('os');
const path = require('path');
const fs = require('fs');
const { execAsyncSpawn } = require('../../../util/exec-async-command');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const KnownError = require('../../../errors/known-error');

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
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
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
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
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const addPHPBrewInitiatorLineToConfigFile = () => ({
    task: async (ctx, task) => {
        const shellName = process.env.SHELL.split('/').pop();

        const shellConfigFileName = `.${shellName}rc`;

        const addLineToShellConfigFIle = await task.prompt({
            type: 'Select',
            message: `To finish configuring PHPBrew we need to add ${logger.style.code('[[ -e ~/.phpbrew/bashrc ]] && source ~/.phpbrew/bashrc')} line to your ${ shellConfigFileName } file.
Do you want to do it now?`,
            choices: [{
                name: 'yes',
                message: 'Yeah, thanks'
            }, {
                name: 'no',
                message: 'No, I will deal with this myself'
            }]
        });

        if (addLineToShellConfigFIle === 'no') {
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
                type: 'Select',
                message: `Unfortunately we cannot automatically add necessary configuration for your shell ${process.env.SHELL}!
You will need to that manually!

Add following string to your shells configuration file: ${logger.style.code('[[ -e ~/.phpbrew/bashrc ]] && source ~/.phpbrew/bashrc')}

When you ready, press Enter and installation will continue.`,
                choices: [
                    {
                        name: 'yes',
                        message: 'YES'
                    },
                    {
                        name: 'no',
                        message: 'Exit installation'
                    }
                ]
            });

            if (continueInstall === 'no') {
                throw new KnownError(`Add following string to your shells configuration file: ${logger.style.code('[[ -e ~/.phpbrew/bashrc ]] && source ~/.phpbrew/bashrc')}

Then you can continue installation.`);
            }
        }
    }
});

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const installPHPBrew = () => ({
    title: 'Installing PHPBrew',
    task: async (ctx, task) => {
        if (process.platform === 'darwin') {
            return task.newListr([
                installXcode(),
                installPHPBrewBinary(),
                addPHPBrewInitiatorLineToConfigFile()
            ]);
        }

        return task.newListr([
            installPHPBrewBinary(),
            addPHPBrewInitiatorLineToConfigFile()
        ]);
    }
});

module.exports = installPHPBrew;
