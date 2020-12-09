/* eslint-disable no-param-reassign */
const fs = require('fs');
const { config } = require('../../config');
const pathExists = require('../../util/path-exists');

const createCacheFolder = {
    title: 'Checking cache folder',
    task: async (ctx, task) => {
        const cacheFolderExists = await pathExists(config.cacheDir);

        if (cacheFolderExists) {
            task.skip('Cache folder already created!');
            return;
        }

        await fs.promises.mkdir(config.cacheDir);
        task.title = 'Cache folder created.';
    }
};

module.exports = createCacheFolder;
