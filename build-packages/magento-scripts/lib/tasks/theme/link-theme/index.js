/* eslint-disable no-param-reassign */
const themeSymlink = require('./theme-symlink');
const installTheme = require('./install-theme');
const themeSubtask = require('./theme-subtask');
const upgradeMagento = require('./upgrade-magento');
const disablePageCache = require('./disable-page-cache');
const { getCachedPorts } = require('../../../util/ports');
const getMagentoVersionConfig = require('../../../config/get-magento-version-config');
const checkThemeFolder = require('./check-theme-folder');

const linkTheme = {
    title: 'Linking theme',
    task: async (ctx, task) => task.newListr([
        checkThemeFolder,
        themeSymlink,
        getMagentoVersionConfig,
        getCachedPorts,
        installTheme,
        themeSubtask,
        upgradeMagento,
        disablePageCache
    ], {
        concurrent: false,
        exitOnError: true,
        rendererOptions: {
            collapse: false
        },
        ctx
    }),
    options: {
        bottomBar: 5
    }
};

module.exports = linkTheme;
