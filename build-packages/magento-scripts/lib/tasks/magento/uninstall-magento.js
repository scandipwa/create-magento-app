const runMagentoCommand = require('../../util/run-magento')
const pathExists = require('../../util/path-exists')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const uninstallMagento = () => ({
    title: 'Uninstall Magento App',
    task: async (ctx, task) => {
        const {
            config: { baseConfig }
        } = ctx
        const appFolderExists = await pathExists(baseConfig.magentoDir)
        if (!appFolderExists) {
            task.skip()
            return
        }

        const { code } = await runMagentoCommand(ctx, 'setup:db:status', {
            throwNonZeroCode: false
        })

        // Magento application is not installed
        if (code === 1) {
            task.skip()
            return
        }
        await runMagentoCommand(ctx, 'setup:uninstall', {
            callback: (t) => {
                task.output = t
            }
        })
    },
    options: {
        bottomBar: Infinity
    }
})

module.exports = uninstallMagento
