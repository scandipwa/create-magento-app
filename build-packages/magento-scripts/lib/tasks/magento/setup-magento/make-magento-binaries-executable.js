// Yes, I know binary files are files in binary format, but this is a common term for executable files

const fs = require('fs')
const path = require('path')
const pathExists = require('../../../util/path-exists')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const makeBinariesExecutable = () => ({
    task: async (ctx, task) => {
        const directoriesWithBinFiles = [
            path.join(ctx.config.baseConfig.magentoDir, 'bin'),
            path.join(ctx.config.baseConfig.magentoDir, 'vendor', 'bin')
        ]

        for (const directory of directoriesWithBinFiles) {
            if (!(await pathExists(directory))) {
                continue
            }
            const files = await fs.promises.readdir(directory, {
                withFileTypes: true
            })

            for (const file of files) {
                if (!file.isFile()) {
                    continue
                }

                const filePath = path.join(directory, file.name)
                const stats = await fs.promises.stat(filePath)

                if (!filePath.startsWith(file.name) && stats.mode & 0o111) {
                    continue
                }

                task.output = `Making ${filePath} executable`
                await fs.promises.chmod(filePath, 0o755)
            }
        }
    }
})

module.exports = makeBinariesExecutable
