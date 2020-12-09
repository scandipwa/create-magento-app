const fs = require('fs');
const { config } = require('../../config');
const pathExists = require('../../util/path-exists');

const removeCacheFolder = {
    title: 'Cleaning cache',
    task: async (ctx, task) => {
        const cacheExists = await pathExists(config.cacheDir);
        if (!cacheExists) {
            task.skip();
            return;
        }

        await fs.promises.rmdir(config.cacheDir, {
            recursive: true
        });
    }
};

module.exports = removeCacheFolder;
