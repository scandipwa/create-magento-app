/* eslint-disable no-param-reassign */
const path = require('path');
const getJsonfileData = require('../../../util/get-jsonfile-data');
const pathExists = require('../../../util/path-exists');

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const checkThemeFolder = {
    title: 'Checking theme folder',
    task: async (ctx) => {
        const { themepath } = ctx;

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

        const composerData = await getJsonfileData(path.join(absoluteThemePath, 'composer.json'));

        if (!composerData) {
            throw new Error(`composer.json file not found in "${themepath}"`);
        }

        ctx.composerData = composerData;
        ctx.absoluteThemePath = absoluteThemePath;
    }
};

module.exports = checkThemeFolder;
