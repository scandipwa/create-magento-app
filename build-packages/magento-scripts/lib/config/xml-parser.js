const { XMLParser, XMLBuilder } = require('fast-xml-parser')
const fs = require('fs')
const path = require('path')
const pathExists = require('../util/path-exists')

/**
 * @type {Partial<import('fast-xml-parser').X2jOptions>}
 */
const xmlParserConfig = {
    ignoreAttributes: false,
    parseAttributeValue: false,
    trimValues: true,
    allowBooleanAttributes: true,
    cdataPropName: '_cdata'
}

/**
 * @type {Partial<import('fast-xml-parser').XmlBuilderOptions>}
 */
const xmlBuilderConfig = {
    ignoreAttributes: false,
    cdataPropName: '_cdata',
    format: true,
    suppressEmptyNode: true,
    suppressBooleanAttributes: false,
    processEntities: true
}

const parser = new XMLParser(xmlParserConfig)
const builder = new XMLBuilder(xmlBuilderConfig)

/**
 * Load xml file to js object
 * @param {String} filePath
 */
const loadXmlFile = async (filePath) => {
    const fileData = await fs.promises.readFile(filePath, 'utf-8')

    return parser.parse(fileData)
}

/**
 * Build xml from js object and write it to file
 * @param {String} filePath
 * @param {String} fileData
 */
const buildXmlFile = async (filePath, fileData) => {
    const xmlFileData = builder.build(fileData).replace(/&quot;/gi, '"')

    const { dir } = path.parse(filePath)

    if (!(await pathExists(dir))) {
        await fs.promises.mkdir(dir, {
            recursive: true
        })
    }

    await fs.promises.writeFile(filePath, xmlFileData, 'utf-8')
}

module.exports = {
    loadXmlFile,
    buildXmlFile
}
