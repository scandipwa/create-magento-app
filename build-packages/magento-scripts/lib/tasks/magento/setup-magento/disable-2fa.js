const runMagentoCommand = require('../../../util/run-magento');

module.exports = {
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
        await runMagentoCommand('module:disable Magento_TwoFactorAuth', {
            magentoVersion
        });
        await runMagentoCommand('cache:flush', {
            magentoVersion
        });
    }
};
