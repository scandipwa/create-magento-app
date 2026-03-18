const fs = require('fs')
const path = require('path')
const pathExists = require('../../../util/path-exists')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const clearLogs = () => ({
    title: 'Clearing Magento logs',
    task: async (ctx, task) => {
        let deletedLogsCount = 0
        await Promise.all(
            [
                './var/log/system.log',
                './var/log/debug.log',
                './var/log/xdebug.log'
            ].map(async (logPath) => {
                if (await pathExists(path.join(process.cwd(), logPath))) {
                    await fs.promises.rm(path.join(process.cwd(), logPath))
                    deletedLogsCount++
                }
            })
        )

        if (deletedLogsCount === 0) {
            task.skip()
        }
    }
})

module.exports = clearLogs
