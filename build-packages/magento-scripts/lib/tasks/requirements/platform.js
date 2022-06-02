const os = require('os');
const macosVersion = require('macos-version');
const systeminformation = require('systeminformation');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { platforms, darwinMinimalVersion } = require('../../config');
const dependencyCheck = require('./dependency');
const { getArch } = require('../../util/arch');
const getIsWsl = require('../../util/is-wsl');
const KnownError = require('../../errors/known-error');

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const checkPlatform = () => ({
    title: 'Checking platform',
    task: async (ctx, task) => {
        const currentPlatform = os.platform();

        if (!platforms.includes(currentPlatform)) {
            throw new KnownError(
                `Your current OS platform is ${ logger.style.misc(currentPlatform) }.
                Unfortunately, currently we only support ${ platforms.map((platform) => logger.style.misc(platform)).join(',') }.`
            );
        }

        if (macosVersion.isMacOS && !macosVersion.isGreaterThanOrEqualTo(darwinMinimalVersion)) {
            throw new KnownError(
                'Please update your system!',
                `MacOS bellow version ${ logger.style.misc(darwinMinimalVersion) } is not supported.`
            );
        }

        ctx.arch = await getArch();

        ctx.isArm = ctx.arch === 'arm64';
        ctx.isWsl = await getIsWsl();

        ctx.platform = currentPlatform;
        ctx.platformVersion = currentPlatform !== 'darwin' ? os.release() : macosVersion();
        ctx.isArmMac = ctx.isArm && ctx.platform === 'darwin';

        const { manufacturer, brand, cores } = await systeminformation.cpu();

        task.title = `Running on ${currentPlatform} ${ctx.platformVersion} (${manufacturer} ${brand} ${cores} threads)`;

        const installDependenciesTask = await dependencyCheck();

        if (installDependenciesTask) {
            return task.newListr(
                installDependenciesTask,
                {
                    rendererOptions: {
                        showTimer: false
                    }
                }
            );
        }
    }
});

module.exports = checkPlatform;
