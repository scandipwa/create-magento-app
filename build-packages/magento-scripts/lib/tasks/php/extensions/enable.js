/* eslint-disable max-len */
const phpbrewConfig = require('../../../config/phpbrew');
const { execAsyncSpawn } = require('../../../util/exec-async-command');
const { getPHPForPHPBrewBin } = require('../../../util/get-php-for-phpbrew');

/**
 * @param {String} extensionName
 * @param {import('../../../../typings/index').PHPExtensionInstallationInstruction} extensionOptions
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const enableExtension = (extensionName, extensionOptions) => ({
    title: `Enabling ${extensionName} extension`,
    task: async (ctx, task) => {
        const phpBinForPHPBrew = await getPHPForPHPBrewBin();
        const {
            config,
            config: { php }
        } = ctx;
        const { hooks } = extensionOptions;

        if (extensionOptions.enable) {
            await Promise.resolve(extensionOptions.enable(ctx, task));
        } else {
            if (hooks && hooks.postEnable) {
                await Promise.resolve(hooks.postEnable(config));
            }

            await execAsyncSpawn(`source ${phpbrewConfig.bashrcPath} && \
            phpbrew use ${ php.version } && \
            phpbrew ext enable ${ extensionName }`,
            {
                callback: (t) => {
                    task.output = t;
                },
                useRosetta2: true,
                env: phpBinForPHPBrew ? {
                    ...process.env,
                    PATH: `${phpBinForPHPBrew}:${process.env.PATH}`
                } : process.env
            });

            if (hooks && hooks.postEnable) {
                await Promise.resolve(hooks.postEnable(config));
            }
        }
    },
    options: {
        bottomBar: 10
    }
});

module.exports = enableExtension;
