/* eslint-disable no-param-reassign */
const { execAsyncSpawn } = require('../../../util/exec-async-command');
const safeRegexExtract = require('../../../util/safe-regex-extract');

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const getPHPBrewVersion = {
    task: async (ctx) => {
        const { result, code } = await execAsyncSpawn('phpbrew --version', {
            withCode: true
        });

        if (code === 0) {
            const PHPBrewVersion = safeRegexExtract({
                string: result,
                regex: /phpbrew - ([\d.]+)/i,
                onNoMatch: () => {
                    throw new Error(`No phpbrew version found in phpbrew version output!\n\n${result}`);
                }
            });

            ctx.PHPBrewVersion = PHPBrewVersion;
        }
    }
};

module.exports = getPHPBrewVersion;
