/* eslint-disable consistent-return,no-param-reassign */
const os = require('os');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const dependenciesForPlatforms = require('../../../config/dependencies-for-platforms');
const { execAsyncSpawn, execCommandTask } = require('../../../util/exec-async-command');
const sleep = require('../../../util/sleep');

const pkgRegex = /^(\S+)\/\S+\s(\S+)\s\S+\s\S+$/i;

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const ubuntuDependenciesCheck = {
    title: 'Checking Ubuntu Linux dependencies',
    task: async (ctx, task) => {
        const installedDependencies = (await execAsyncSpawn('apt list --installed')).split('\n')
            .filter((pkg) => pkgRegex.test(pkg))
            .map((pkg) => pkg.match(pkgRegex))
            .map((pkg) => pkg[1]);

        const dependenciesToInstall = dependenciesForPlatforms
            .Ubuntu
            .filter((dep) => {
                if (Array.isArray(dep)) {
                    return !dep.some((dp) => installedDependencies.includes(dp));
                }

                return !installedDependencies.includes(dep);
            });

        // if (dependenciesToInstall.length > 0) {
        //     throw new Error(`Missing dependencies detected!\n\nYou can install them by running the following command: ${ logger.style.code(`apt-get install ${dependenciesToInstall.map((dep) => (Array.isArray(dep) ? dep[0] : dep)).join(' ') }`)}`);
        // }
        if (dependenciesToInstall.length > 0) {
            const cmd = `sudo apt-get install ${dependenciesToInstall.map((dep) => (Array.isArray(dep) ? dep[0] : dep)).join(' ') }`;
            const installCommand = logger.style.code(cmd);
            const dependenciesWordFormatter = `dependenc${dependenciesToInstall.length > 1 ? 'ies' : 'y'}`;
            task.output = `Missing ${ dependenciesWordFormatter } ${ logger.style.code(dependenciesToInstall.join(' ')) } detected!`;

            let promptSkipper = false;
            const timer = async () => {
                for (let i = 5 * 60; i !== 0; i--) {
                    // eslint-disable-next-line no-await-in-loop
                    await sleep(1000);
                    if (promptSkipper) {
                        return null;
                    }
                    task.title = `Checking Ubuntu dependencies (${i} sec left...)`;
                }
                task.cancelPrompt();
                return 'timeout';
            };

            const installAnswer = await Promise.race([
                task.prompt({
                    type: 'Select',
                    message: `Do you want to install missing ${ dependenciesWordFormatter } now?`,
                    name: 'installAnswer',
                    choices: [
                        {
                            name: 'install',
                            message: `Install ${ dependenciesWordFormatter } now!`
                        },
                        {
                            name: 'not-install',
                            message: `Do not install ${ dependenciesWordFormatter } now!`
                        }
                    ]
                }),
                timer()
            ]);

            promptSkipper = true;

            if (installAnswer === 'timeout') {
                throw new Error(`User timeout.

You need to install missing ${ dependenciesWordFormatter } manually, run the following command: ${ installCommand }`);
            }

            if (installAnswer === 'not-install') {
                throw new Error(`User chosen to not install ${ dependenciesWordFormatter } now.

You need to install missing ${ dependenciesWordFormatter } manually, run the following command: ${ installCommand }`);
            }

            if (installAnswer === 'install') {
                task.output = `[sudo] password for ${ os.userInfo().username };`;
                return task.newListr([
                    execCommandTask(`${ cmd } -y`, {
                        callback: (str) => {
                            task.output = str;
                        },
                        pipeInput: true
                    })
                ]);
            }
        }
    },
    options: {
        bottomBar: 10
    }
};

module.exports = ubuntuDependenciesCheck;
