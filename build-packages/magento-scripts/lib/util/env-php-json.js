const path = require('path');
const UnknownError = require('../errors/unknown-error');
const pathExists = require('./path-exists');
const runPhpCode = require('./run-php');

const envPhpToJson = async (projectPath = process.cwd(), { magentoVersion }) => {
    const envPhpPath = path.join(projectPath, 'app', 'etc', 'env.php');
    if (!await pathExists(envPhpPath)) {
        return null;
    }
    const { code, result } = await runPhpCode(`-r "echo json_encode(require '${envPhpPath}');"`, {
        magentoVersion
    });

    if (code !== 0) {
        throw new UnknownError(`Received non-zero code during converting app/etc/env.php to json:\n\n${result}`);
    }
    try {
        return JSON.parse(result);
    } catch (e) {
        throw new UnknownError(`Ooops! Something went wrong when trying to parse app/etc/env.php file!\n\n${e}\n\nFile result: ${result}`);
    }
};

module.exports = envPhpToJson;
