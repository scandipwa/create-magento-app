/* eslint-disable no-param-reassign */
const path = require('path');
const fs = require('fs');
const pathExists = require('../../../util/path-exists');

const getComposerData = async (composerPath) => {
    const composerExists = await pathExists(composerPath);

    if (!composerExists) {
        return null;
    }

    return JSON.parse(await fs.promises.readFile(composerPath, 'utf-8'));
};
const checkThemeFolder = {
    task: async (ctx, task) => {
        const { themepath } = ctx;
        task.output = 'Checking theme folder';

        let absoluteThemePath = path.join(process.cwd(), themepath);

        // check if path not relative
        if (!(await pathExists(path.join(absoluteThemePath, 'composer.json')))) {
            // if composer.json is not found, then it's not correct path
            // and we need to test if it's alsolute one
            if (await pathExists(path.join(themepath, 'composer.json'))) {
                // if so, use it as absolute path
                absoluteThemePath = themepath;
            }
        } else {
            // path is relative, so we use it
            absoluteThemePath = themepath;
        }

        const composerData = await getComposerData(path.join(absoluteThemePath, 'composer.json'));

        if (!composerData) {
            throw new Error(`composer.json file not found in "${themepath}"`);
        }

        ctx.composerData = composerData;
        ctx.absoluteThemePath = absoluteThemePath;
    }
};

module.exports = checkThemeFolder;
