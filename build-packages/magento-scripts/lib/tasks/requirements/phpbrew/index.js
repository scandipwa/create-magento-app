const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const KnownError = require('../../../errors/known-error');
const { execAsyncSpawn } = require('../../../util/exec-async-command');
const installPHPBrew = require('./install');
const getPHPBrewVersion = require('./version');

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const checkPHPBrew = () => ({
    title: 'Checking phpbrew',
    task: async (ctx, task) => {
        const { code } = await execAsyncSpawn('phpbrew --version', {
            withCode: true
        });

        if (code !== 0) {
            const automaticallyInstallPHPBrew = await task.prompt({
                type: 'Confirm',
                message: `You don't have PHPBrew installed!
Do you want to install it automatically?`
            });

            if (automaticallyInstallPHPBrew) {
                return task.newListr([
                    installPHPBrew(),
                    getPHPBrewVersion(),
                    {
                        task: (ctx) => {
                            task.title = `Using PHPBrew version ${ctx.PHPBrewVersion}`;
                        }
                    }
                ]);
            }

            throw new KnownError(
                `To install PHPBrew, you must first make sure the requirements are met.
The requirements are available here: ${ logger.style.link('https://github.com/phpbrew/phpbrew/wiki/Requirement') }.
Then, you can follow the installation instruction, here: ${ logger.style.link('https://phpbrew.github.io/phpbrew/#installation') }.
When completed, try running this script again.`
            );
        }

        return task.newListr([
            getPHPBrewVersion(),
            {
                task: (ctx) => {
                    task.title = `Using PHPBrew version ${ctx.PHPBrewVersion}`;
                }
            }
        ]);
    }
});

module.exports = checkPHPBrew;
