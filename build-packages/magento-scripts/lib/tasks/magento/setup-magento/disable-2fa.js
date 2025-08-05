const configPhpToJson = require('../../../util/config-php-json')
const getJsonfileData = require('../../../util/get-jsonfile-data')
const path = require('path')
const composerTask = require('../../../util/composer-task')
const magentoTask = require('../../../util/magento-task')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
module.exports = () => ({
    title: 'Disabling 2FA module',
    task: async (ctx, task) => {
        // Check if MarkShust module is already installed via composer.lock
        const composerLockPath = path.join(
            ctx.config.baseConfig.magentoDir,
            'composer.lock'
        )
        const composerLockData = await getJsonfileData(composerLockPath)

        const tasks = []

        const isModuleInstalled =
            composerLockData &&
            composerLockData.packages &&
            composerLockData.packages.some(
                /** @param {{ name: string }} pkg */ (pkg) =>
                    pkg.name ===
                    'markshust/magento2-module-disabletwofactorauth'
            )

        if (!isModuleInstalled) {
            tasks.push(
                composerTask(
                    'require --dev markshust/magento2-module-disabletwofactorauth'
                )
            )
        }

        const getIsModuleEnabled = async () => {
            const configData = await configPhpToJson(ctx)
            return (
                configData &&
                configData.modules &&
                configData.modules.MarkShust_DisableTwoFactorAuth !==
                    undefined &&
                configData.modules.MarkShust_DisableTwoFactorAuth !== 0
            )
        }

        // Check if module is enabled in Magento
        const isModuleEnabled =
            isModuleInstalled || (await getIsModuleEnabled())

        if (!isModuleEnabled) {
            tasks.push(
                magentoTask('module:enable MarkShust_DisableTwoFactorAuth'),
                magentoTask('setup:upgrade')
            )
        } else {
            task.skip()

            return
        }

        return task.newListr(tasks)
    }
})
