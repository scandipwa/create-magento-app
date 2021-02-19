let isGlobal = null;

/**
 * Detects if package is installed globally
 * @returns {Boolean}
 */
module.exports = () => {
    if (isGlobal !== null) {
        return isGlobal;
    }

    isGlobal = false;

    if (process.platform === 'win32') {
        const paths = process.env.Path.split(';');
        for (let i = 0; i < paths.length; i++) {
            if (paths[i].indexOf('npm') !== -1
          && (process.mainModule || require.main
          ).filename.indexOf(paths[i]) !== -1) {
                isGlobal = true;
                break;
            }
        }
    } else {
        isGlobal = process.env._ !== process.execPath;
    }

    return isGlobal;
};
