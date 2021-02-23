const fs = require('fs');
const pathExists = require('./path-exists');

const getJsonfileData = async (filePath) => {
    const fileExists = await pathExists(filePath);

    if (!fileExists) {
        return null;
    }

    return JSON.parse(await fs.promises.readFile(filePath, 'utf-8'));
};

module.exports = getJsonfileData;
