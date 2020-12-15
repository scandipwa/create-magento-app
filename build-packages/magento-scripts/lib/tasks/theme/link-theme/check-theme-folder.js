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

        const absoluteThemePath = path.join(process.cwd(), themepath);

        const composerData = await getComposerData(path.join(absoluteThemePath, 'composer.json'));

        if (!composerData) {
            throw new Error(`composer.json file not found in "${themepath}"`);
        }

        ctx.composerData = composerData;
        ctx.absoluteThemePath = absoluteThemePath;
    }
};

module.exports = checkThemeFolder;
