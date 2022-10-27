const fs = require('fs')
const path = require('path')

const pathExists = require('./path-exists')

/**
 * @param {string} dirPath
 * @returns {Promise<boolean>}
 */
const rmdirSafe = async (dirPath) => {
    const dirExists = await pathExists(dirPath)

    if (!dirExists) {
        return true
    }
    const files = await fs.promises.readdir(dirPath, {
        encoding: 'utf-8',
        withFileTypes: true
    })

    for (const file of files) {
        const filePath = path.join(dirPath, file.name)
        await fs.promises.rm(filePath, {
            recursive: true,
            force: true
        })
    }

    return true
}

module.exports = rmdirSafe
