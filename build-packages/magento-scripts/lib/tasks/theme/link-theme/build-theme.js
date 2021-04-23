/* eslint-disable no-param-reassign */
const path = require('path');
const pathExists = require('../../../util/path-exists');
const { execAsyncSpawn } = require('../../../util/exec-async-command');

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const buildTheme = {
    title: 'Building theme',
    task: async ({ themepath }, task) => {
        if (await pathExists(path.join(themepath, 'magento', 'Magento_Theme'))) {
            task.skip();
            return;
        }

        task.title = `Building theme in ${themepath}`;
        await execAsyncSpawn('BUILD_MODE=magento npm run build', {
            cwd: path.join(process.cwd(), themepath),
            callback: (t) => {
                task.output = t;
            }
        });
    },
    options: {
        bottomBar: 10
    }
};

module.exports = buildTheme;
