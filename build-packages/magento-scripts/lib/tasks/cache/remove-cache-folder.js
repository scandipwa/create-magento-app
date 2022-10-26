const fs = require('fs')
const pathExists = require('../../util/path-exists')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const removeCacheFolder = () => ({
    title: 'Cleaning cache',
    task: async ({ config: { baseConfig } }, task) => {
        const cacheExists = await pathExists(baseConfig.cacheDir)
        if (!cacheExists) {
            task.skip()
            return
        }

        await fs.promises.rmdir(baseConfig.cacheDir, {
            recursive: true
        })
    }
})

module.exports = removeCacheFolder
