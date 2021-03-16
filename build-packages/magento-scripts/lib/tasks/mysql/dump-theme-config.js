/* eslint-disable no-param-reassign */
const dumpThemeConfig = {
    title: 'Dumping themes and theme configuration',
    task: async (ctx) => {
        const { mysqlConnection } = ctx;

        const [themes] = await mysqlConnection.query('select * from theme;');
        if (themes.length === 0) {
            throw new Error('Themes not found in theme table are not found');
        }

        const [themeIdConfig] = await mysqlConnection.query('select * from core_config_data where path = \'design/theme/theme_id\';');
        if (themeIdConfig.length === 0) {
            throw new Error('Theme config in core_config_data table is not found.');
        }

        ctx.themeDump = {
            themes,
            themeIdConfig: themeIdConfig[0]
        };
    }
};

module.exports = dumpThemeConfig;
