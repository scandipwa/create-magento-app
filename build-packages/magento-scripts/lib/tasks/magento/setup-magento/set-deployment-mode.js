const magentoTask = require('../../../util/magento-task')
const runMagentoCommand = require('../../../util/run-magento')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
module.exports = () => ({
    title: 'Switching Magento mode',
    task: async (ctx, task) => {
        const {
            config: {
                magentoConfiguration: { mode }
            }
        } = ctx
        const { result } = await runMagentoCommand(ctx, 'deploy:mode:show', {
            throwNonZeroCode: false
        })

        if (result.includes(mode)) {
            task.skip()
            return
        }

        const magentoModeSwitchTasks = [
            magentoTask(`deploy:mode:set ${mode} --skip-compilation`)
        ]

        if (mode === 'production') {
            magentoModeSwitchTasks.push(
                magentoTask('setup:di:compile'),
                magentoTask('setup:static-content:deploy')
            )
        }

        return task.newListr(magentoModeSwitchTasks)
    }
})
