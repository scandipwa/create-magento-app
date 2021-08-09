/* eslint-disable no-restricted-syntax,no-await-in-loop */
const { updateTableValues } = require('../../util/database');

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const restoreThemeConfig = {
    title: 'Restoring themes and theme configuration',
    task: async (ctx, task) => {
        const { themeDump, mysqlConnection } = ctx;

        const { themeIdConfig, themes } = themeDump;

        if (!themeIdConfig && themes.length === 0) {
            task.skip();
            return;
        }

        // restore theme config
        if (themeIdConfig) {
            await updateTableValues('core_config_data', [
                {
                    path: themeIdConfig.path,
                    value: themeIdConfig.value
                }
            ], { mysqlConnection, task });
        }

        if (themes.length === 0) {
            return;
        }

        // restore themes
        const themeKeys = Object.keys(themes[0]);
        await mysqlConnection.query('delete from theme;');

        for (const theme of themes) {
            await mysqlConnection.query(`
                insert into theme (${themeKeys.join(', ')})
                values (${themeKeys.map(() => '?').join(', ')})
            `, Object.values(theme));
        }
    }
};

module.exports = restoreThemeConfig;
