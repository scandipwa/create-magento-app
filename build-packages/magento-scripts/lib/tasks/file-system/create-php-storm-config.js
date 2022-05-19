const setConfigFile = require('../../util/set-config');
const pathExists = require('../../util/path-exists');
const path = require('path');
const fs = require('fs');

const createPhpStormConfig = () => ({
    task: (ctx, task) => task.newListr([
        {
            title: 'Setting PHPStorm config',
            skip: (ctx) => ctx.skipPhpstormConfig,
            task: async ({ config: { phpStorm }, ports }) => {
                const { phpLanguageLevel } = phpStorm.php;
                const jdbcUrl = `jdbc:mysql://localhost:${ports.mysql}/magento`;

                try {
                    await setConfigFile({
                        configPathname: phpStorm.xdebug.path,
                        template: phpStorm.xdebug.templatePath,
                        overwrite: true,
                        templateArgs: {
                            phpStorm
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
                            phpLanguageLevel
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
                            phpStorm
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
                            phpStorm,
                            jdbcUrl
                        }
                    });
                } catch (e) {
                    throw new Error(`Unexpected error accrued during dataSources.xml config creation\n\n${e}`);
                }

                if (!await pathExists(path.resolve('./.idea/dataSources'))) {
                    await fs.promises.mkdir(path.resolve('./.idea/dataSources'));
                }

                try {
                    await setConfigFile({
                        configPathname: phpStorm.inspectionTools.path,
                        template: phpStorm.inspectionTools.templatePath,
                        overwrite: true,
                        templateArgs: {}
                    });
                } catch (e) {
                    throw new Error(`Unexpected error accrued during Project_Default.xml config creation\n\n${e}`);
                }
            }
        }
    ])
});

module.exports = createPhpStormConfig;
