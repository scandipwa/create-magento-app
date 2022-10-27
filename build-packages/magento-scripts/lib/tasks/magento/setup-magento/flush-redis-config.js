const { execAsyncSpawn } = require('../../../util/exec-async-command')
const UnknownError = require('../../../errors/unknown-error')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
module.exports = () => ({
    title: 'Flushing Magento Redis cache',
    task: async ({ ports, config: { docker }, isDockerDesktop }) => {
        const {
            redis: { name }
        } = docker.getContainers(ports)
        const host = !isDockerDesktop ? 'localhost' : 'host.docker.internal'
        const port = !isDockerDesktop ? '6379' : ports.redis
        const result = await execAsyncSpawn(
            `docker exec ${name} redis-cli -h ${host} -p ${port} -n 0 flushdb`
        )

        if (!result.trim().includes('OK')) {
            throw new UnknownError(
                `Unexpected output from redis flush command: ${result}`
            )
        }
    }
})
