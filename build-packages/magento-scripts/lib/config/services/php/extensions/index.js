const path = require('path')
const fs = require('fs')

/**
 * @type {Record<string, import('../../../../../typings/index').PHPExtensionInstallationInstruction>}
 */
const phpExtensionInstallationInstructions = fs
    .readdirSync(__dirname, {
        withFileTypes: true
    })
    .filter((f) => f.isFile())
    .filter((f) => f.name !== 'index.js')
    .map((f) => ({
        name: path.parse(f.name).name,
        extension: require(path.join(__dirname, f.name))
    }))
    .reduce((acc, val) => ({ ...acc, [val.name]: val.extension }), {})

module.exports = {
    phpExtensionInstallationInstructions
}
