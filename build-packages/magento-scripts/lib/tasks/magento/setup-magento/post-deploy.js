const runMagentoCommand = require('../../../util/run-magento');

module.exports = {
    title: 'Disabling maintenance mode',
    task: async ({ magentoVersion }, task) => {
        const { result } = await runMagentoCommand('maintenance:status', {
            magentoVersion,
            throwNonZeroCode: false
        });

        if (result.includes('maintenance mode is not active')) {
            task.skip();
            return;
        }

        await runMagentoCommand('maintenance:disable', { magentoVersion });
    }
};
