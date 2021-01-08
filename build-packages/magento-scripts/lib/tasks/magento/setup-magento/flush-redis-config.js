const { execAsyncSpawn } = require('../../../util/exec-async-command');
const macosVersion = require('macos-version');

module.exports = {
    title: 'Flushing Magento redis cache',
    task: async ({ ports, config: { docker } }) => {
        const { redis: { name } } = docker.getContainers(ports);
        const host = macosVersion.isMacOS ? 'host.docker.internal' : 'localhost';
        const port = macosVersion.isMacOS ? ports.redis : '6379';
        const result = await execAsyncSpawn(`docker exec ${ name } redis-cli -h ${ host } -p ${ port } -n 0 flushdb`);

        if (!result.trim().includes('OK')) {
            throw new Error(`Unexpected output from redis flush command: ${result}`);
        }
    }
};
