const setConfigFile = require('../../util/set-config');
const phpStormConfiguration = require('../../config/php-storm');

const createPhpStormConfig = () => ({
    title: 'Setting PHPStorm config',
    task: async () => {
        const config = phpStormConfiguration();
        const xDebug2Port = '9111';
        const xDebug3Port = '9003';
        const debugServerAddress = 'http://localhost';
        const serverName = 'create-magento-app';
        const runManagerName = 'create-magento-app';
        const sessionId = 'PHPSTORM';
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
            throw new Error(`Unexpected error accrued during php.ini config creation\n\n${e}`);
        }
    }
});

module.exports = createPhpStormConfig;
