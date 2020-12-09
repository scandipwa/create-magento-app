const fs = require('fs');

const pathExists = async (path) => {
    try {
        await fs.promises.access(path, fs.constants.F_OK);
    } catch (e) {
        return false;
    }

    return true;
};

module.exports = pathExists;
