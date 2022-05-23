const os = require('os');
const KnownError = require('../../../errors/known-error');
const { execAsyncSpawn } = require('../../../util/exec-async-command');
const getIsWsl = require('../../../util/is-wsl');
const pathExists = require('../../../util/path-exists');
const sleep = require('../../../util/sleep');
const { systemctlControl } = require('../../../util/systemctl');

const pathToDockerApplication = '/Applications/Docker.app';

const getDockerVersion = () => execAsyncSpawn('docker version --format {{.Server.Version}}', {
    withCode: true
});

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const checkDockerStatusMacOS = () => ({
    title: 'Checking Docker status on MacOS',
    task: async (ctx, task) => {
        const { result, code } = await getDockerVersion();

        if (code !== 0 && result.includes('Is the docker daemon running?')) {
            const dockerOpenAppConfirmation = await task.prompt({
                type: 'Confirm',
                message: 'Looks like Docker is not running, would you like us to open a Docker for Mac application and wait for it to start up?'
            });

            if (dockerOpenAppConfirmation && await pathExists(pathToDockerApplication)) {
                await execAsyncSpawn(`open ${pathToDockerApplication}`);
                let ready = false;
                let attempts = 0;
                while (!ready) {
                    if (attempts > 24 && !ready) {
                        throw new KnownError('Docker haven\'t started in 2 mins, exiting...');
                    }
                    try {
                        const { code: startupCode } = await getDockerVersion();
                        if (startupCode !== 0) {
                            task.output = `Waiting for Docker to startup for ${attempts * 5} seconds...`;
                            attempts++;
                            await sleep(5000);
                        } else {
                            ready = true;
                        }
                    } catch (e) {
                        //
                    }
                }

                return;
            }

            task.skip('User skipped running Docker');
        }
    },
    options: {
        bottomBar: 10
    }
});

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const checkDockerStatusWSL = () => ({
    title: 'Checking Docker status on Windows WSL',
    task: async () => {
        const { result, code } = await getDockerVersion();

        if (code !== 0 && result.includes('Is the docker daemon running?')) {
            throw new KnownError(`Docker is not running!

Please open Docker Desktop application for Windows and make sure that Docker is running. Then you can try again!`);
        }
    }
});

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const checkDockerStatusLinux = () => ({
    title: 'Checking Docker status on Linux',
    task: async (ctx, task) => {
        const dockerService = systemctlControl('docker');

        const isRunning = await dockerService.isRunning();
        const isEnabled = await dockerService.isEnabled();

        if (!isEnabled && !isRunning) {
            const dockerStartConfirmation = await task.prompt({
                type: 'Confirm',
                message: `Looks like Docker is not enabled and not running, would you like to enable and run it?

This action requires root privileges.`
            });

            if (dockerStartConfirmation) {
                await dockerService.enableAndStart();

                return;
            }
            task.skip('User skipped running Docker');
        } else if (!isRunning) {
            const dockerStartConfirmation = await task.prompt({
                type: 'Confirm',
                message: `Looks like Docker is not running, would you like to run it?

This action requires root privileges.`
            });

            if (dockerStartConfirmation) {
                await dockerService.start();

                return;
            }
            task.skip('User skipped running Docker');
        }
    }
});

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const checkDockerStatus = () => ({
    title: 'Checking Docker status',
    task: async (ctx, task) => {
        if (os.platform() === 'darwin') {
            return task.newListr(checkDockerStatusMacOS());
        }
        if (!await getIsWsl()) {
            return task.newListr(checkDockerStatusLinux());
        }

        return task.newListr(checkDockerStatusWSL());
    }
});

module.exports = checkDockerStatus;
