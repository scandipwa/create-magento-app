const runMagentoCommand = require('../../../util/run-magento');

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
module.exports = {
    title: 'Disabling 2fa for admin.',
    task: async ({ magentoVersion }, task) => {
        const { result, code } = await runMagentoCommand('module:status Magento_TwoFactorAuth', {
            magentoVersion,
            throwNonZeroCode: false
        });

        if (code !== 0) {
            task.skip();
            return;
        }

        if (result.includes('Module is disabled')) {
            task.skip();
            return;
        }

        // Disable 2FA due admin login issue
        await runMagentoCommand('module:disable Magento_TwoFactorAuth', {
            magentoVersion
        });
    }
};
