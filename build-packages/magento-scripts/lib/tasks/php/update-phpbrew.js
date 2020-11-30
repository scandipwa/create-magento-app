/* eslint-disable no-param-reassign */
const { execAsyncSpawn } = require('../../util/exec-async-command');

const updatePhpBrew = {
    title: 'Update PHPBrew known php versions',
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
            throw new Error(`Unexpected error while updating phpbrew known php versions\n\n${e}`);
        }
    },
    options: {
        bottomBar: 10
    }
};

module.exports = updatePhpBrew;
