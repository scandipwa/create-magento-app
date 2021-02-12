const fs = require('fs');
const { baseConfig } = require('../../config');
const pathExists = require('../../util/path-exists');

const removeCacheFolder = {
    title: 'Cleaning cache',
    task: async (ctx, task) => {
        const cacheExists = await pathExists(baseConfig.cacheDir);
        if (!cacheExists) {
            task.skip();
            return;
        }

        await fs.promises.rmdir(baseConfig.cacheDir, {
            recursive: true
        });
    }
};

module.exports = removeCacheFolder;
