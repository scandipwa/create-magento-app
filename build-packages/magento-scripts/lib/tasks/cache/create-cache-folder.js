const fs = require('fs');
const pathExists = require('../../util/path-exists');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const createCacheFolder = () => ({
    task: async ({ config: { baseConfig } }, task) => {
        const cacheFolderExists = await pathExists(baseConfig.cacheDir);

        if (cacheFolderExists) {
            task.skip();
            return;
        }

        task.title = 'Creating cache folder';

        await fs.promises.mkdir(baseConfig.cacheDir, {
            recursive: true
        });
    }
});

module.exports = createCacheFolder;
