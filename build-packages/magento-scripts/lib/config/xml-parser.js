const { XMLParser, XMLBuilder } = require('fast-xml-parser');
const fs = require('fs');

/**
 * @type {import('fast-xml-parser').X2jOptions}
 */
const xmlParserConfig = {
    ignoreAttributes: false,
    parseAttributeValue: false,
    trimValues: true
};

/**
 * @type {Partial<import('fast-xml-parser').XmlBuilderOptions>}
 */
const xmlBuilderConfig = {
    ...xmlParserConfig,
    format: true,
    suppressEmptyNode: true
};

const parser = new XMLParser(xmlParserConfig);
const builder = new XMLBuilder(xmlBuilderConfig);

/**
 * Load xml file to js object
 * @param {String} filePath
 */
const loadXmlFile = async (filePath) => {
    const fileData = await fs.promises.readFile(filePath, 'utf-8');

    return parser.parse(fileData);
};

/**
 * Build xml from js object and write it to file
 * @param {String} filePath
 * @param {String} fileData
 */
const buildXmlFile = async (filePath, fileData) => {
    const xmlFileData = builder.build(fileData);

    await fs.promises.writeFile(filePath, xmlFileData, 'utf-8');
};

module.exports = {
    loadXmlFile,
    buildXmlFile
};
