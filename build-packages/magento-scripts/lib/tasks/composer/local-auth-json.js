/* eslint-disable no-param-reassign */
const path = require('path');
const fs = require('fs');
const pathExists = require('../../util/path-exists');

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const localAuthJson = {
    task: async (ctx, task) => {
        if (await pathExists(path.join(process.cwd(), 'auth.json'))) {
            task.title = 'Using local auth.json';
            process.env.COMPOSER_AUTH = await fs.promises.readFile(path.join(process.cwd(), 'auth.json'));
        }
    },
    options: {
        showTimer: false
    }
};

module.exports = localAuthJson;
