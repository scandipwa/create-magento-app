const symlinkTheme = require('./symlink-theme');
const installTheme = require('./install-theme');
const disablePageCache = require('../magento/setup-magento/disable-page-cache');
const disablePageBuilder = require('../magento/setup-magento/disable-page-builder');
const buildTheme = require('./build-theme');
const upgradeMagento = require('../magento/setup-magento/upgrade-magento');
const setupPersistedQuery = require('./setup-persisted-query');
const updateEnvPHP = require('../php/update-env-php');
const semver = require('semver');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const linkTheme = () => ({
    title: 'Linking theme',
    task: async (ctx, task) => {
        const {
            config: { overridenConfiguration },
            absoluteThemePath,
            themePath,
            composerData
        } = ctx;
        const {
            magento: { edition: magentoEdition },
            magentoVersion
        } = overridenConfiguration;

        const isEnterprise = magentoEdition === 'enterprise';
        const isPageBuilderInstalled = isEnterprise && semver.satisfies(semver.coerce(magentoVersion), '^2.4');

        /**
         * @type {import('../../../typings/theme').Theme}
         */
        const theme = {
            themePath,
            absoluteThemePath,
            composerData
        };

        task.title = `Linking theme from ${themePath}`;

        return task.newListr([
            symlinkTheme(theme),
            installTheme(theme),
            updateEnvPHP(),
            setupPersistedQuery(),
            upgradeMagento(),
            disablePageCache(),
            ...(isPageBuilderInstalled ? [disablePageBuilder()] : []),
            buildTheme(theme)
        ]);
    },
    options: {
        bottomBar: 5
    }
});

module.exports = linkTheme;
