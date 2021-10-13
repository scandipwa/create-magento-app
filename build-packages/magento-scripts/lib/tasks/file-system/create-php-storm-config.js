const setConfigFile = require('../../util/set-config');
const phpStormConfiguration = require('../../config/php-storm');
const pathExists = require('../../util/path-exists');
const path = require('path');
const fs = require('fs');

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
        const databaseDriver = config.database.driver;

        const phpVersion = config.php.version;

        const { dataSourceManagerName } = config.database;
        const { jdbcUrl } = config.database;
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
                    sessionId,
                    databaseDriver
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

        try {
            await setConfigFile({
                configPathname: config.database.dataSourcesLocal.path,
                template: config.database.dataSourcesLocal.templatePath,
                overwrite: true,
                templateArgs: {
                    dataSourceManagerName
                }
            });
        } catch (e) {
            throw new Error(`Unexpected error accrued during dataSources.local.xml config creation\n\n${e}`);
        }

        try {
            await setConfigFile({
                configPathname: config.database.dataSources.path,
                template: config.database.dataSources.templatePath,
                overwrite: true,
                templateArgs: {
                    dataSourceManagerName,
                    jdbcUrl
                }
            });
        } catch (e) {
            throw new Error(`Unexpected error accrued during dataSources.xml config creation\n\n${e}`);
        }

        if (!await pathExists(path.resolve('./.idea/dataSources'))) {
            await fs.promises.mkdir(path.resolve('./.idea/dataSources'));
        }
    }
});

module.exports = createPhpStormConfig;
