const runMagentoCommand = require('../../../util/run-magento');

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const disableMaintenanceMode = () => ({
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
});

module.exports = disableMaintenanceMode;
