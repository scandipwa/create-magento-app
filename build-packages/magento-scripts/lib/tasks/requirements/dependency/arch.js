/* eslint-disable consistent-return,no-param-reassign */
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const dependenciesForPlatforms = require('../../../config/dependencies-for-platforms');
const { execAsyncSpawn, execCommandTask } = require('../../../util/exec-async-command');
const sleep = require('../../../util/sleep');

const pkgRegex = /(\S+)\s(\S+)/i;

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const archDependenciesCheck = {
    title: 'Checking Arch Linux dependencies',
    task: async (ctx, task) => {
        const installedDependencies = (await execAsyncSpawn('pacman -Qe')).split('\n')
            .map((pkg) => {
                const result = pkg.match(pkgRegex);

                if (!result) {
                    throw new Error(`Package without a version!\n\n${pkg}\n\nHOW?`);
                }

                return result[1];
            });

        const dependenciesToInstall = dependenciesForPlatforms['Arch Linux'].filter((dep) => !installedDependencies.some((pkg) => pkg === dep));

        // if (dependenciesToInstall.length > 0) {
        //     throw new Error(`Missing dependencies detected!\n\nYou can install them by running the following command: ${ logger.style.code(`pamac install ${dependenciesToInstall.join(' ') }`)}`);
        // }
        if (dependenciesToInstall.length > 0) {
            const installCommand = logger.style.code(`pamac install ${dependenciesToInstall.join(' ') }`);
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
                    task.title = `Checking MacOS dependencies (${i} sec left...)`;
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
                return task.newListr([
                    execCommandTask(`brew install ${dependenciesToInstall.join(' ') }`)
                ]);
            }
        }
    },
    options: {
        bottomBar: 10
    }
};

module.exports = archDependenciesCheck;
