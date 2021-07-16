const fs = require('fs');
const pathExists = require('./path-exists');

const getJsonfileData = async (filePath) => {
    const fileExists = await pathExists(filePath);

    if (!fileExists) {
        return null;
    }

    try {
        return JSON.parse(await fs.promises.readFile(filePath, 'utf-8'));
    } catch (e) {
        throw new Error(`Ooops! Something went wrong when trying to json parse ${filePath} file!\n\n${e}`);
    }
};

module.exports = getJsonfileData;
