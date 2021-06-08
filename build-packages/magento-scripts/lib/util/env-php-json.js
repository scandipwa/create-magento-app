const path = require('path');
const runPhpCode = require('./run-php');

const envPhpToJson = async (projectPath = process.cwd()) => {
    const { code, result } = await runPhpCode(`-r "echo json_encode(require '${path.join(projectPath, 'app', 'etc', 'env.php')}');"`);

    if (code !== 0) {
        throw new Error(result);
    }

    return JSON.parse(result);
};

module.exports = envPhpToJson;
