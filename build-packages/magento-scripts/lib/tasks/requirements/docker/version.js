const { execAsyncSpawn } = require('../../../util/exec-async-command');

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const getDockerVersion = () => ({
    task: async (ctx) => {
        const { result, code } = await execAsyncSpawn('docker version --format {{.Server.Version}}', {
            withCode: true
        });

        if (code === 0) {
            const dockerVersion = result.split('').filter((c) => /[\d.]/i.test(c)).join('') || result;

            ctx.dockerVersion = dockerVersion;
        } else {
            throw new Error(`Got unexpected result during Docker version retrieval!\n\n${ result }`);
        }
    }
});

module.exports = getDockerVersion;
