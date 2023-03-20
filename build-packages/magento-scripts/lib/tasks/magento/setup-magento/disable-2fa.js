const configPhpToJson = require('../../../util/config-php-json')
const runMagentoCommand = require('../../../util/run-magento')
const semver = require('semver')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
module.exports = () => ({
    title: 'Disabling 2fa for admin',
    task: async (ctx, task) => {
        const { modules } = await configPhpToJson(ctx)

        if (
            modules.Magento_TwoFactorAuth !== undefined &&
            modules.Magento_TwoFactorAuth !== 0
        ) {
            if (semver.gte(ctx.magentoVersion, '2.4.6')) {
                await runMagentoCommand(
                    ctx,
                    'module:disable Magento_AdminAdobeImsTwoFactorAuth'
                )
            }
            await runMagentoCommand(ctx, 'module:disable Magento_TwoFactorAuth')

            return
        }

        task.skip()
    }
})
