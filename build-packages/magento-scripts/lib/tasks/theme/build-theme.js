/* eslint-disable no-param-reassign */
const path = require('path');
const pathExists = require('../../util/path-exists');
const { execAsyncSpawn } = require('../../util/exec-async-command');

/**
 * @type {(theme: import('../../../typings/theme').Theme) => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const buildTheme = ({ themePath }) => ({
    title: 'Building theme',
    task: async (ctx, task) => {
        if (await pathExists(path.join(themePath, 'magento', 'Magento_Theme'))) {
            task.skip();
            return;
        }

        task.title = `Building theme in ${themePath}`;
        await execAsyncSpawn('BUILD_MODE=magento npm run build', {
            cwd: path.join(process.cwd(), themePath),
            callback: (t) => {
                task.output = t;
            }
        });
    },
    options: {
        bottomBar: 10
    }
});

module.exports = buildTheme;
