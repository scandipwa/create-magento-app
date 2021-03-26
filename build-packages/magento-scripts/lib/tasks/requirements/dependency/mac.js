/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const dependenciesForPlatforms = require('../../../config/dependencies-for-platforms');
const { execAsyncSpawn, execCommandTask } = require('../../../util/exec-async-command');
const sleep = require('../../../util/sleep');

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const macDependenciesCheck = {
    title: 'Checking MacOS dependencies',
    task: async (ctx, task) => {
        const installedDependencies = (await execAsyncSpawn('brew list')).split('\n');

        const dependenciesToInstall = dependenciesForPlatforms.darwin.filter((dep) => !installedDependencies.includes(dep));

        if (dependenciesToInstall.length > 0) {
            const installCommand = logger.style.code(`brew install ${dependenciesToInstall.join(' ') }`);
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

module.exports = macDependenciesCheck;
