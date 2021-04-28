/* eslint-disable no-param-reassign */
const getMagentoVersionConfig = require('../../../config/get-magento-version-config');
const { getCachedPorts } = require('../../../config/get-port-config');
const themeSymlink = require('./theme-symlink');
const installTheme = require('./install-theme');
const themeSubtask = require('./theme-subtask');
const disablePageCache = require('./disable-page-cache');
const checkThemeFolder = require('./check-theme-folder');
const buildTheme = require('./build-theme');
const getConfigFromConfigFile = require('../../../config/get-config-from-config-file');
const upgradeMagento = require('../../magento/setup-magento/upgrade-magento');

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const linkTheme = {
    title: 'Linking theme',
    task: async (ctx, task) => {
        task.title = `Linking theme from ${ctx.themepath}`;
        return task.newListr([
            checkThemeFolder,
            themeSymlink,
            getMagentoVersionConfig,
            getConfigFromConfigFile,
            getCachedPorts,
            installTheme,
            themeSubtask,
            upgradeMagento,
            disablePageCache,
            buildTheme
        ], {
            concurrent: false,
            exitOnError: true,
            rendererOptions: {
                collapse: false
            },
            ctx
        });
    },
    options: {
        bottomBar: 5
    }
};

module.exports = linkTheme;
