const configPhpToJson = require('../../../util/config-php-json')
const runMagentoCommand = require('../../../util/run-magento')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
module.exports = () => ({
    title: 'Disabling 2fa for admin',
    task: async (ctx, task) => {
        const { modules } = await configPhpToJson(ctx)

        const isMagentoTFAEnabled =
            modules.Magento_TwoFactorAuth !== undefined &&
            modules.Magento_TwoFactorAuth !== 0

        const isMagentoAdminAdobeImsTwoFactorAuthEnabled =
            modules.Magento_AdminAdobeImsTwoFactorAuth !== undefined &&
            modules.Magento_AdminAdobeImsTwoFactorAuth !== 0

        if (isMagentoAdminAdobeImsTwoFactorAuthEnabled) {
            await runMagentoCommand(
                ctx,
                'module:disable Magento_AdminAdobeImsTwoFactorAuth'
            )
        }
        if (isMagentoTFAEnabled) {
            await runMagentoCommand(ctx, 'module:disable Magento_TwoFactorAuth')
        }

        if (isMagentoAdminAdobeImsTwoFactorAuthEnabled || isMagentoTFAEnabled) {
            return
        }

        task.skip()
    }
})
