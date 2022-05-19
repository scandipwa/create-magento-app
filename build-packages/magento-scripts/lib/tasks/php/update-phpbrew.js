const UnknownError = require('../../errors/unknown-error');
const { execAsyncSpawn } = require('../../util/exec-async-command');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const updatePhpBrew = () => ({
    title: 'Updating PHPBrew PHP versions',
    task: async ({ config: { php } }, task) => {
        try {
            const knownPhpVersions = await execAsyncSpawn('phpbrew known');

            if (knownPhpVersions.includes(`${php.version}`)) {
                task.skip();
                return;
            }

            await execAsyncSpawn('phpbrew known --update', {
                callback: (t) => {
                    task.output = t;
                }
            });
        } catch (e) {
            throw new UnknownError(`Unexpected error while updating phpbrew known php versions\n\n${e}`);
        }
    },
    options: {
        bottomBar: 10
    }
});

module.exports = updatePhpBrew;
