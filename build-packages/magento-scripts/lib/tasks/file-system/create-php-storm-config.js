const setConfigFile = require('../../util/set-config');
const pathExists = require('../../util/path-exists');
const path = require('path');
const fs = require('fs');

const createPhpStormConfig = () => ({
    title: 'Setting PHPStorm config',
    task: async ({ config: { phpStorm }, ports }) => {
        const xDebug2Port = phpStorm.xdebug.v2Port;
        const xDebug3Port = phpStorm.xdebug.v3Port;
        const { debugServerAddress } = phpStorm.xdebug;
        const { serverName } = phpStorm.xdebug;
        const { runManagerName } = phpStorm.xdebug;
        const { sessionId } = phpStorm.xdebug;
        const databaseDriver = phpStorm.database.driver;

        const phpVersion = phpStorm.php.version;

        const { dataSourceManagerName } = phpStorm.database;
        const jdbcUrl = `jdbc:mysql://localhost:${ports.mysql}/magento`;
        try {
            await setConfigFile({
                configPathname: phpStorm.xdebug.path,
                template: phpStorm.xdebug.templatePath,
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
                configPathname: phpStorm.php.path,
                template: phpStorm.php.templatePath,
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
                configPathname: phpStorm.database.dataSourcesLocal.path,
                template: phpStorm.database.dataSourcesLocal.templatePath,
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
                configPathname: phpStorm.database.dataSources.path,
                template: phpStorm.database.dataSources.templatePath,
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
