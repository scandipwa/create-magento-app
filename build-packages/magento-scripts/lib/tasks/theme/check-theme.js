const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const path = require('path');
const fs = require('fs');
const getJsonfileData = require('../../util/get-jsonfile-data');
const pathExists = require('../../util/path-exists');
const matchFilesystem = require('../../util/match-filesystem');

/**
 * @type {(theme: import('../../../typings/theme').Theme) => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const checkTheme = (theme) => ({
    task: async (ctx, task) => {
        const packageJsonPath = path.join(theme.absoluteThemePath, 'package.json');

        if (!await pathExists(packageJsonPath)) {
            task.skip();
            return;
        }

        const packageJsonData = await getJsonfileData(packageJsonPath);
        const themeConfig = packageJsonData.mosaic || packageJsonData.scandipwa;

        if (!themeConfig || themeConfig.type !== 'theme') {
            task.skip();
            return;
        }

        /**
         * now we're in scandipwa territory
         */
        const magentoThemeDirPath = path.join(theme.themePath, 'magento', 'Magento_Theme');
        const isMagentoThemeDirMatching = await matchFilesystem(magentoThemeDirPath, {
            templates: true,
            web: [
                'static'
            ]
        });
        const noticeMessage = {
            title: `${theme.themePath} theme`,
            message: `Theme ${theme.themePath} requires building!
You can build your theme by running the following command:
${logger.style.code(`cd ${theme.themePath}`)}
${logger.style.code('BUILD_MODE=magento npm run build')} or to run with a dev server run the following: ${logger.style.code('BUILD_MODE=magento npm start')}`
        };

        if (isMagentoThemeDirMatching) {
            const files = await fs.promises.readdir(path.join(magentoThemeDirPath, 'templates'), { withFileTypes: true });
            if (files.some(({ name }) => name.endsWith('.phtml'))) {
                task.skip();
                return;
            }
        }
        ctx.buildThemeNotice = ctx.buildThemeNotice
            ? [...ctx.buildThemeNotice, noticeMessage]
            : [noticeMessage];
    }
});

module.exports = checkTheme;
