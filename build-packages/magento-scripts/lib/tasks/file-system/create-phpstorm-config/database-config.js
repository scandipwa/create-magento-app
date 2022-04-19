const setConfigFile = require('../../../util/set-config');

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const setupDatabaseConfig = () => ({
    title: 'Set up database configuration',
    task: async (ctx) => {
        const {
            config: {
                phpStorm
            },
            ports
        } = ctx;
        const jdbcUrl = `jdbc:mysql://localhost:${ports.mysql}/magento`;

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
    }
});

module.exports = setupDatabaseConfig;
