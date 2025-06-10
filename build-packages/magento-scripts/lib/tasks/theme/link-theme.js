const symlinkTheme = require('./symlink-theme')
const installTheme = require('./install-theme')
const enableFullPageCacheWithVarnish = require('../magento/setup-magento/enable-full-page-cache-with-varnish')
const disablePageBuilder = require('../magento/setup-magento/disable-page-builder')
const buildTheme = require('./build-theme')
const upgradeMagento = require('../magento/setup-magento/upgrade-magento')
const updateEnvPHP = require('../php/update-env-php')
const semver = require('semver')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const linkTheme = () => ({
    title: 'Linking theme',
    task: async (ctx, task) => {
        const {
            config: { overridenConfiguration },
            absoluteThemePath,
            themePath,
            composerData,
            databaseConnection
        } = ctx
        const {
            magento: { edition: magentoEdition },
            magentoVersion
        } = overridenConfiguration

        const isEnterprise = magentoEdition === 'enterprise'
        const isPageBuilderInstalled =
            isEnterprise &&
            semver.satisfies(semver.coerce(magentoVersion), '^2.4')
        const [queryResult] = await databaseConnection.query(`
                SELECT value AS isPagebuilderEnabled
                FROM core_config_data
                WHERE path = 'cms/pagebuilder/enabled'
            `)

        const [{ isPagebuilderEnabled = 1 }] = queryResult.length
            ? queryResult
            : [{}]

        /**
         * @type {import('../../../typings/theme').Theme}
         */
        const theme = {
            themePath,
            absoluteThemePath,
            composerData
        }

        task.title = `Linking theme from ${themePath}`

        return task.newListr([
            symlinkTheme(theme),
            installTheme(theme),
            updateEnvPHP(),
            upgradeMagento(),
            enableFullPageCacheWithVarnish(),
            ...(isPageBuilderInstalled && Number(isPagebuilderEnabled)
                ? [disablePageBuilder()]
                : []),
            buildTheme(theme)
        ])
    },
    options: {
        bottomBar: 5
    }
})

module.exports = linkTheme
