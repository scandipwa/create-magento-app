/* eslint-disable no-param-reassign */
const symlinkTheme = require('./symlink-theme');
const installTheme = require('./install-theme');
const disablePageCache = require('../magento/setup-magento/disable-page-cache');
const buildTheme = require('./build-theme');
const upgradeMagento = require('../magento/setup-magento/upgrade-magento');

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const linkTheme = {
    title: 'Linking theme',
    task: async (ctx, task) => {
        const { absoluteThemePath, themePath, composerData } = ctx;
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
            upgradeMagento,
            disablePageCache,
            buildTheme(theme)
        ], {
            concurrent: false,
            exitOnError: true
        });
    },
    options: {
        bottomBar: 5
    }
};

module.exports = linkTheme;
