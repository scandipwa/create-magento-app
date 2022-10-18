const eta = require('eta')
const fs = require('fs')
const path = require('path')
const pathExists = require('./path-exists')

const setConfigFile = async ({
    configPathname,
    template,
    overwrite,
    templateArgs = {}
}) => {
    const pathOk = await pathExists(configPathname)

    if (pathOk && !overwrite) {
        return true
    }

    const configTemplate = await fs.promises.readFile(template, 'utf-8')
    const compliedConfig = await eta.render(configTemplate, {
        date: new Date().toUTCString(),
        ...templateArgs
    })

    const { dir } = path.parse(configPathname)

    const dirExists = await pathExists(dir)
    if (!dirExists) {
        await fs.promises.mkdir(dir, { recursive: true })
    }
    await fs.promises.writeFile(configPathname, compliedConfig, {
        encoding: 'utf-8'
    })

    return true
}

module.exports = setConfigFile
