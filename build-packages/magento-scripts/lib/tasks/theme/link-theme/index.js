/* eslint-disable no-param-reassign */
const getMagentoVersionConfig = require('../../../config/get-magento-version-config');
const { getCachedPorts } = require('../../../config/get-port-config');
const themeSymlink = require('./theme-symlink');
const installTheme = require('./install-theme');
const themeSubtask = require('./theme-subtask');
const upgradeMagento = require('./upgrade-magento');
const disablePageCache = require('./disable-page-cache');
const checkThemeFolder = require('./check-theme-folder');

const linkTheme = {
    title: 'Linking theme',
    task: async (ctx, task) => {
        task.title = `Linking theme from ${ctx.themepath}`;
        return task.newListr([
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
        });
    },
    options: {
        bottomBar: 5
    }
};

module.exports = linkTheme;
