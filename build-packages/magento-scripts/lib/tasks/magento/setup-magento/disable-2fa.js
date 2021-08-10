const runMagentoCommand = require('../../../util/run-magento');

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
module.exports = () => ({
    title: 'Disabling 2fa for admin.',
    task: async ({ magentoVersion }, task) => {
        const { result } = await runMagentoCommand('module:status Magento_TwoFactorAuth', {
            magentoVersion,
            throwNonZeroCode: false
        });

        if (result.includes('Module is disabled')) {
            task.skip();
            return;
        }

        // Disable 2FA due admin login issue
        if (result.includes('Module is enabled')) {
            await runMagentoCommand('module:disable Magento_TwoFactorAuth', {
                magentoVersion
            });

            return;
        }

        task.skip();
    }
});
