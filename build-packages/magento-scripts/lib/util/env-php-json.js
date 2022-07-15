const path = require('path');
const UnknownError = require('../errors/unknown-error');
const { runPHPContainerCommand } = require('../tasks/php/run-php-container');
const pathExists = require('./path-exists');

const envPhpToJson = async (ctx, projectPath = '/var/www/html') => {
    const envPhpPath = path.join(projectPath, 'app', 'etc', 'env.php');
    if (!await pathExists(envPhpPath)) {
        return null;
    }
    const { code, result } = await runPHPContainerCommand(ctx, `php -r "echo json_encode(require '${envPhpPath}');"`, {
        withCode: true
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
