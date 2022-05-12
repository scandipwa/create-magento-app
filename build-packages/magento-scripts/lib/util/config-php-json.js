const path = require('path');
const runPhpCode = require('./run-php');

const configPhpToJson = async (projectPath = process.cwd(), { magentoVersion }) => {
    const { code, result } = await runPhpCode(`-r "echo json_encode(require '${path.join(projectPath, 'app', 'etc', 'config.php')}');"`, {
        magentoVersion
    });

    if (code !== 0) {
        throw new Error(result);
    }
    try {
        return JSON.parse(result);
    } catch (e) {
        throw new Error(`Ooops! Something went wrong when trying to parse app/etc/config.php file!\n\n${e}\n\nFile result: ${result}`);
    }
};

module.exports = configPhpToJson;
