const path = require('path');
const UnknownError = require('../errors/unknown-error');
const { runPHPContainerCommand } = require('../tasks/php/run-php-container');
const pathExists = require('./path-exists');

const configPhpToJson = async (ctx, projectPath = '/var/www/html') => {
    const configPhpPath = path.join(projectPath, 'app', 'etc', 'config.php');
    if (!await pathExists(configPhpPath)) {
        return null;
    }
    const { code, result } = await runPHPContainerCommand(ctx, `php -r "echo json_encode(require '${configPhpPath}');"`, {
        withCode: true
    });

    if (code !== 0) {
        throw new UnknownError(`Received non-zero code during converting app/etc/config.php to json:\n\n${result}`);
    }
    try {
        return JSON.parse(result);
    } catch (e) {
        throw new UnknownError(`Ooops! Something went wrong when trying to parse app/etc/config.php file!\n\n${e}\n\nFile result: ${result}`);
    }
};

module.exports = configPhpToJson;
