const fs = require('fs')
const pathExists = require('./path-exists')

const checkForXDGOpen = async () => {
    const pathParts = process.env.PATH.split(':')

    const results = await Promise.all(
        pathParts.map(async (pathPart) => {
            if (!(await pathExists(pathPart))) {
                return false
            }

            const files = await fs.promises.readdir(pathPart, {
                encoding: 'utf-8',
                withFileTypes: true
            })

            return files.some(
                (file) => file.isFile() && file.name === 'xdg-open'
            )
        })
    )

    return results.includes(true)
}

module.exports = checkForXDGOpen
