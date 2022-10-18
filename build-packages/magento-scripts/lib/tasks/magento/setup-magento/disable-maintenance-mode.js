const runMagentoCommand = require('../../../util/run-magento')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const disableMaintenanceMode = () => ({
    title: 'Disabling maintenance mode',
    task: async (ctx, task) => {
        const { result } = await runMagentoCommand(ctx, 'maintenance:status', {
            throwNonZeroCode: false
        })

        if (result.includes('maintenance mode is not active')) {
            task.skip()
            return
        }

        await runMagentoCommand(ctx, 'maintenance:disable')
    }
})

module.exports = disableMaintenanceMode
