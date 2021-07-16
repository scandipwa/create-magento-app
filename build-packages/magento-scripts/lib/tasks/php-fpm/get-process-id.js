const fs = require('fs');
const pathExists = require('../../util/path-exists');

const getProcessId = async (fpmPidFilePath) => {
    const pidExists = await pathExists(fpmPidFilePath);

    if (pidExists) {
        return fs.promises.readFile(fpmPidFilePath, 'utf-8');
    }

    return null;
};

module.exports = getProcessId;
