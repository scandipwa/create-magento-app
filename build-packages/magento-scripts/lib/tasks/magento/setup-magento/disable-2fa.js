const configPhpToJson = require('../../../util/config-php-json');
const runMagentoCommand = require('../../../util/run-magento');

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
module.exports = () => ({
    title: 'Disabling 2fa for admin',
    task: async ({ magentoVersion }, task) => {
        const { modules } = await configPhpToJson(process.cwd(), { magentoVersion });

        if (modules.Magento_TwoFactorAuth !== undefined && modules.Magento_TwoFactorAuth !== 0) {
            await runMagentoCommand('module:disable Magento_TwoFactorAuth', {
                magentoVersion
            });

            return;
        }

        task.skip();
    }
});
