const path = require('path');
const runPhpCode = require('./run-php');

const envPhpToJson = async (projectPath = process.cwd(), { magentoVersion }) => {
    const { code, result } = await runPhpCode(`-r "echo json_encode(require '${path.join(projectPath, 'app', 'etc', 'env.php')}');"`, {
        magentoVersion
    });

    if (code !== 0) {
        throw new Error(result);
    }
    try {
        return JSON.parse(result);
    } catch (e) {
        throw new Error(`Ooops! Something went wrong when trying to parse app/etc/env.php file!\n\n${e}`);
    }
};

module.exports = envPhpToJson;
