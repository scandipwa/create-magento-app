const semver = require('semver')
const UnknownError = require('../../errors/unknown-error')
const { containerApi } = require('../docker/containers')
const { execAsync } = require('../../util/exec-async')
const { systemApi } = require('../docker/system')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const checkCGroupVersion = () => ({
    title: 'Checking CGroup version',
    task: async (ctx) => {
        ctx.cgroupVersion = 'v1'

        if (ctx.platform === 'linux' && !ctx.isWsl) {
            const cgroupVersion = await execAsync(`stat -fc %T /sys/fs/cgroup/`)

            if (cgroupVersion && cgroupVersion.includes('cgroup2')) {
                ctx.cgroupVersion = 'v2'

                return
            } else {
                const kernelReleaseVersionResult =
                    ctx.platformVersion.match(/(\d+\.\d+\.\d+)/)

                if (
                    kernelReleaseVersionResult &&
                    kernelReleaseVersionResult.length > 0
                ) {
                    const kernelVersion = kernelReleaseVersionResult[1]

                    if (semver.satisfies(kernelVersion, '>=6.12.0')) {
                        ctx.cgroupVersion = 'v2'
                    }
                }
            }
        }

        const dockerSystemVersions = await systemApi.version({
            formatToJSON: true
        })

        const kernelReleaseVersionResult =
            dockerSystemVersions.Server.KernelVersion.match(/(\d+\.\d+\.\d+)/)

        if (
            kernelReleaseVersionResult &&
            kernelReleaseVersionResult.length > 0
        ) {
            const kernelVersion = kernelReleaseVersionResult[1]

            if (semver.satisfies(kernelVersion, '>=6.12.0')) {
                ctx.cgroupVersion = 'v2'
            }
        }
    }
})

module.exports = checkCGroupVersion
