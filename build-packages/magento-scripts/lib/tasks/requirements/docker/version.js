/* eslint-disable no-param-reassign */
const { execAsyncSpawn } = require('../../../util/exec-async-command');
const safeRegexExtract = require('../../../util/safe-regex-extract');

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const getDockerVersion = {
    task: async (ctx) => {
        const { result, code } = await execAsyncSpawn('docker -v', {
            withCode: true
        });

        if (code === 0) {
            const dockerVersion = safeRegexExtract({
                string: result,
                regex: /docker version ([\d.]+)/i,
                onNoMatch: () => {
                    throw new Error(`No docker version found in docker version output!\n\n${result}`);
                }
            });

            ctx.dockerVersion = dockerVersion;
        }
    }
};

module.exports = getDockerVersion;
