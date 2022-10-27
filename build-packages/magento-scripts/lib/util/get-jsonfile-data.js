const fs = require('fs')
const UnknownError = require('../errors/unknown-error')
const pathExists = require('./path-exists')

/**
 * @type {<T>(fileData: string) => Promise<T | null>}
 */
const getJsonfileData = async (filePath) => {
    const fileExists = await pathExists(filePath)

    if (!fileExists) {
        return null
    }

    try {
        return JSON.parse(await fs.promises.readFile(filePath, 'utf-8'))
    } catch (e) {
        throw new UnknownError(
            `Ooops! Something went wrong when trying to json parse ${filePath} file!\n\n${e}`
        )
    }
}

module.exports = getJsonfileData
