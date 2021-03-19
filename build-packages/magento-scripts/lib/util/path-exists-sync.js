const fs = require('fs');

const pathExistsSync = (path) => {
    try {
        fs.accessSync(path, fs.constants.F_OK);
    } catch (e) {
        return false;
    }

    return true;
};

module.exports = pathExistsSync;
