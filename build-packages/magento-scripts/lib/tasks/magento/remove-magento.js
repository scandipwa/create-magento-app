const fs = require('fs')
const path = require('path')
const pathExists = require('../../util/path-exists')

const magentoFiles = [
    '.htaccess',
    '.htaccess.sample',
    '.php_cs.dist',
    '.user.ini',
    'CHANGELOG.md',
    'COPYING.txt',
    'Gruntfile.js.sample',
    'LICENSE.txt',
    'LICENSE_AFL.txt',
    'SECURITY.md',
    'app',
    'auth.json.sample',
    'bin',
    'composer.json',
    'composer.lock',
    'dev',
    'generated',
    'grunt-config.json.sample',
    'index.php',
    'lib',
    'nginx.conf.sample',
    'package.json.sample',
    'phpserver',
    'pub',
    'setup',
    'var',
    'vendor'
]

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const removeMagento = () => ({
    title: 'Remove magento application folder',
    skip: async (ctx) => {
        const {
            config: { baseConfig }
        } = ctx
        const appPathExists = await pathExists(baseConfig.magentoDir)

        return !(appPathExists && ctx.force)
    },
    task: async (ctx) => {
        const {
            config: { baseConfig }
        } = ctx
        await Promise.all(
            magentoFiles.map(async (fileName) => {
                const filePath = path.join(baseConfig.magentoDir, fileName)
                const fileExists = await pathExists(filePath)
                if (!fileExists) {
                    return
                }
                const file = await fs.promises.stat(filePath)
                if (file.isFile()) {
                    await fs.promises.unlink(filePath)
                } else if (file.isDirectory()) {
                    await fs.promises.rmdir(filePath, { recursive: true })
                }
            })
        )
    }
})

module.exports = removeMagento
