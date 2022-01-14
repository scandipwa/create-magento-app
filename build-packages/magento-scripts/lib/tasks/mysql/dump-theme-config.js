const { isTableExists } = require('../../util/database');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const dumpThemeConfig = () => ({
    title: 'Dumping themes and theme configuration',
    task: async (ctx, task) => {
        const { mysqlConnection } = ctx;
        if (await isTableExists('magento', 'theme', ctx)) {
            const [themes] = await mysqlConnection.query('select * from theme;');
            if (themes.length === 0) {
                ctx.themeDump = {
                    themes: [],
                    themeIdConfig: undefined // we don't have a config saved
                };
            }

            if (await isTableExists('magento', 'core_config_data', ctx)) {
                const [themeIdConfig] = await mysqlConnection.query('select * from core_config_data where path = \'design/theme/theme_id\';');
                if (themeIdConfig.length !== 0) {
                    ctx.themeDump = {
                        themes,
                        themeIdConfig: themeIdConfig[0]
                    };

                    return;
                }
            }
        } else {
            task.skip();
        }

        ctx.themeDump = {
            themes: [],
            themeIdConfig: undefined // we don't have a config saved
        };
    }
});

module.exports = dumpThemeConfig;
