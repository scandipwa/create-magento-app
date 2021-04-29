/* eslint-disable consistent-return,no-param-reassign */
const os = require('os');
const macosVersion = require('macos-version');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { platforms, darwinMinimalVersion } = require('../../config');
const dependencyCheck = require('./dependency');
const { getArch } = require('../../util/arch');

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const checkPlatform = {
    title: 'Checking platform',
    task: async (ctx, task) => {
        const currentPlatform = os.platform();

        if (!platforms.includes(currentPlatform)) {
            throw new Error(
                `Your current OS platform is ${ logger.style.misc(currentPlatform) }.
                Unfortunately, currently we only support ${ platforms.map((platform) => logger.style.misc(platform)).join(',') }.`
            );
        }

        if (macosVersion.isMacOS && !macosVersion.isGreaterThanOrEqualTo(darwinMinimalVersion)) {
            throw new Error(
                'Please update your system!',
                `MacOS bellow version ${ logger.style.misc(darwinMinimalVersion) } is not supported.`
            );
        }

        ctx.arch = await getArch();

        ctx.isArm = ctx.arch === 'arm64';

        ctx.platform = currentPlatform;
        ctx.platformVersion = currentPlatform !== 'darwin' ? os.release() : macosVersion();

        task.title = `Running on ${currentPlatform} ${ctx.platformVersion}`;

        const installDependenciesTask = await dependencyCheck();

        if (installDependenciesTask) {
            return task.newListr([installDependenciesTask]);
        }
    }
};

module.exports = checkPlatform;
