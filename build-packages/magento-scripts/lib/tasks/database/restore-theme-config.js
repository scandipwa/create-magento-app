const { updateTableValues } = require('../../util/database')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const restoreThemeConfig = () => ({
    title: 'Restoring themes and theme configuration',
    task: async (ctx, task) => {
        const { themeDump, databaseConnection } = ctx

        const { themeIdConfig, themes } = themeDump

        if (!themeIdConfig && themes.length === 0) {
            task.skip()
            return
        }

        // restore theme config
        if (themeIdConfig) {
            await updateTableValues(
                'core_config_data',
                [
                    {
                        path: themeIdConfig.path,
                        value: themeIdConfig.value
                    }
                ],
                { databaseConnection, task }
            )
        }

        if (themes.length === 0) {
            return
        }

        // restore themes
        const themeKeys = Object.keys(themes[0])
        await databaseConnection.query('delete from theme;')

        for (const theme of themes) {
            await databaseConnection.query(
                `
                insert into theme (${themeKeys.join(', ')})
                values (${themeKeys.map(() => '?').join(', ')})
            `,
                Object.values(theme)
            )
        }
    }
})

module.exports = restoreThemeConfig
