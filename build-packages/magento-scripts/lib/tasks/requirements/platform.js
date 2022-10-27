const os = require('os')
const semver = require('semver')
const systeminformation = require('systeminformation')
const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const { platforms, darwinMinimalVersion } = require('../../config')
const { getArch } = require('../../util/arch')
const getIsWsl = require('../../util/is-wsl')
const KnownError = require('../../errors/known-error')
const { getMacOSVersion } = require('../../util/macos-version')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const checkPlatform = () => ({
    title: 'Checking platform',
    task: async (ctx, task) => {
        const currentPlatform = os.platform()

        ctx.arch = await getArch()

        ctx.isArm = ctx.arch === 'arm64'
        ctx.isWsl = await getIsWsl()

        ctx.platform = currentPlatform
        ctx.platformVersion =
            currentPlatform !== 'darwin'
                ? os.release()
                : await getMacOSVersion()
        ctx.isArmMac = ctx.isArm && ctx.platform === 'darwin'

        if (!platforms.includes(currentPlatform)) {
            throw new KnownError(
                `Your current OS platform is ${logger.style.misc(
                    currentPlatform
                )}.
                Unfortunately, currently we only support ${platforms
                    .map((platform) => logger.style.misc(platform))
                    .join(',')}.`
            )
        }

        if (
            ctx.platformVersion &&
            currentPlatform === 'darwin' &&
            !semver.gt(
                ctx.platformVersion,
                semver.coerce(darwinMinimalVersion).version
            )
        ) {
            throw new KnownError(
                'Please update your system!',
                `MacOS bellow version ${logger.style.misc(
                    darwinMinimalVersion
                )} is not supported.`
            )
        }

        const { manufacturer, brand, cores } = await systeminformation.cpu()

        task.title = `Running on ${currentPlatform} ${ctx.platformVersion} (${manufacturer} ${brand} ${cores} threads)`
    }
})

module.exports = checkPlatform
