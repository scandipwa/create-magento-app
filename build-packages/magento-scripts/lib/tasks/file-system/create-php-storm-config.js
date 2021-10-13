const setConfigFile = require('../../util/set-config');
const phpStormConfiguration = require('../../config/php-storm');

const createPhpStormConfig = () => ({
    title: 'Setting PHPStorm config',
    task: async () => {
        const config = phpStormConfiguration();
        const xDebug2Port = config.xdebug.v2Port;
        const xDebug3Port = config.xdebug.v3Port;
        const { debugServerAddress } = config.xdebug;
        const { serverName } = config.xdebug;
        const { runManagerName } = config.xdebug;
        const { sessionId } = config.xdebug;
        const phpVersion = config.php.version;
        try {
            await setConfigFile({
                configPathname: config.xdebug.path,
                template: config.xdebug.templatePath,
                overwrite: true,
                templateArgs: {
                    xDebug2Port,
                    xDebug3Port,
                    debugServerAddress,
                    serverName,
                    runManagerName,
                    sessionId
                }
            });
        } catch (e) {
            throw new Error(`Unexpected error accrued during workspace.xml config creation\n\n${e}`);
        }

        try {
            await setConfigFile({
                configPathname: config.php.path,
                template: config.php.templatePath,
                overwrite: true,
                templateArgs: {
                    phpVersion
                }
            });
        } catch (e) {
            throw new Error(`Unexpected error accrued during php.xml config creation\n\n${e}`);
        }
    }
});

module.exports = createPhpStormConfig;
