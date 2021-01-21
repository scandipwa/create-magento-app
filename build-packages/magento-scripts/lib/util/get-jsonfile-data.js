const fs = require('fs');
const pathExists = require('./path-exists');

const getJsonfileData = async (filePath) => {
    const composerExists = await pathExists(filePath);

    if (!composerExists) {
        return null;
    }

    return JSON.parse(await fs.promises.readFile(filePath, 'utf-8'));
};

module.exports = getJsonfileData;
