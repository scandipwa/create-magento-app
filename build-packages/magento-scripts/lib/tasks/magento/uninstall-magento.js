const runMagentoCommand = require('../../util/run-magento')
const pathExists = require('../../util/path-exists')

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const uninstallMagento = () => ({
    title: 'Uninstall Magento App',
    task: async ({ config: { baseConfig } }, task) => {
        const appFolderExists = await pathExists(baseConfig.magentoDir)
        if (!appFolderExists) {
            task.skip()
            return
        }

        const { code } = await runMagentoCommand('setup:db:status', {
            throwNonZeroCode: false
        })

        // Magento application is not installed
        if (code === 1) {
            task.skip()
            return
        }
        await runMagentoCommand('setup:uninstall', {
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
