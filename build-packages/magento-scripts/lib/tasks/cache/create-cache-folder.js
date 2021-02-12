/* eslint-disable no-param-reassign */
const fs = require('fs');
const { baseConfig } = require('../../config');
const pathExists = require('../../util/path-exists');

const createCacheFolder = {
    title: 'Checking cache folder',
    task: async (ctx, task) => {
        const cacheFolderExists = await pathExists(baseConfig.cacheDir);

        if (cacheFolderExists) {
            task.skip('Cache folder already created!');
            return;
        }

        await fs.promises.mkdir(baseConfig.cacheDir);
        task.title = 'Cache folder created.';
    }
};

module.exports = createCacheFolder;
