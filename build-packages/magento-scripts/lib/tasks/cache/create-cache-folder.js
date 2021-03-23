/* eslint-disable no-param-reassign */
const fs = require('fs');
const { baseConfig } = require('../../config');
const pathExists = require('../../util/path-exists');

const createCacheFolder = {
    title: 'Creating cache folder',
    task: async (ctx, task) => {
        const cacheFolderExists = await pathExists(baseConfig.cacheDir);

        if (cacheFolderExists) {
            task.skip();
            return;
        }

        await fs.promises.mkdir(baseConfig.cacheDir);
    }
};

module.exports = createCacheFolder;
