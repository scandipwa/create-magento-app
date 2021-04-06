const { execAsyncSpawn } = require('../../../util/exec-async-command');
const os = require('os');

const isLinux = os.platform() === 'linux';

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
module.exports = {
    title: 'Flushing Magento redis cache',
    task: async ({ ports, config: { docker } }) => {
        const { redis: { name } } = docker.getContainers(ports);
        const host = isLinux ? 'localhost' : 'host.docker.internal';
        const port = isLinux ? '6379' : ports.redis;
        const result = await execAsyncSpawn(`docker exec ${ name } redis-cli -h ${ host } -p ${ port } -n 0 flushdb`);

        if (!result.trim().includes('OK')) {
            throw new Error(`Unexpected output from redis flush command: ${result}`);
        }
    }
};
