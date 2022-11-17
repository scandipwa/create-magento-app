const os = require('os')
const path = require('path')
const semver = require('semver')
const getJsonfileData = require('../../../util/get-jsonfile-data')
const pathExists = require('../../../util/path-exists')

const dockerSettingsJsonPath = path.join(
    os.homedir(),
    'Library',
    'Group Containers',
    'group.com.docker',
    'settings.json'
)

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const checkDockerPerformance = () => ({
    title: 'Checking Docker Performance',
    skip: async (ctx) =>
        ctx.platform !== 'darwin' ||
        (ctx.platform === 'darwin' &&
            !(await pathExists(dockerSettingsJsonPath))),
    task: async (ctx, task) => {
        const dockerSettings = await getJsonfileData(dockerSettingsJsonPath)

        if (!dockerSettings) {
            task.skip()
            return
        }

        const dockerForMacVersionMatch =
            ctx.dockerServerData &&
            ctx.dockerServerData.Platform.Name.match(/(\d+\.\d+\.\d+)/i)

        const dockerForMacVersion =
            dockerForMacVersionMatch && dockerForMacVersionMatch[1]

        if (
            dockerForMacVersion &&
            ctx.platformVersion &&
            ctx.arch === 'arm64' &&
            semver.gt('12.2.0', ctx.platformVersion) &&
            semver.gt(dockerForMacVersion, '4.6.0')
        ) {
            if (!dockerSettings.useVirtualizationFrameworkVirtioFS) {
                task.title =
                    'Performance is not optimal. VirtioFS is not enabled.'
            }
        }

        if (
            dockerForMacVersion &&
            ctx.platformVersion &&
            ctx.arch === 'x64' &&
            semver.gt('12.3.0', ctx.platformVersion) &&
            semver.gt(dockerForMacVersion, '4.6.0')
        ) {
            if (!dockerSettings.useVirtualizationFrameworkVirtioFS) {
                task.title =
                    'Performance is not optimal. VirtioFS is not enabled.'
            }
        }
    }
})

module.exports = {
    checkDockerPerformance
}
