/* eslint-disable no-param-reassign */
/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const dumpThemeConfig = {
    title: 'Dumping themes and theme configuration',
    task: async (ctx) => {
        const { mysqlConnection } = ctx;

        const [[{ tableCount }]] = await mysqlConnection.query(`
            SELECT count (*) AS tableCount
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = 'magento';
        `);

        if (tableCount !== 0) {
            const [themes] = await mysqlConnection.query('select * from theme;');
            if (themes.length === 0) {
                throw new Error('Themes not found in theme table are not found');
            }

            const [themeIdConfig] = await mysqlConnection.query('select * from core_config_data where path = \'design/theme/theme_id\';');
            if (themeIdConfig.length !== 0) {
                ctx.themeDump = {
                    themes,
                    themeIdConfig: themeIdConfig[0]
                };

                return;
            }
        }

        ctx.themeDump = {
            themes: [],
            themeIdConfig: undefined // we don't have a config saved
        };
    }
};

module.exports = dumpThemeConfig;
