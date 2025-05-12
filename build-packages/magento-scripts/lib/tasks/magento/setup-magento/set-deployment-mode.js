const envPhpToJson = require('../../../util/env-php-json')
const magentoTask = require('../../../util/magento-task')

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
        const envPhpData = await envPhpToJson(ctx)
        if (!envPhpData) {
            task.skip()
            return
        }
        const { MAGE_MODE } = envPhpData

        if (MAGE_MODE === mode) {
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
