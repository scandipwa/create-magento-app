/* eslint-disable no-param-reassign,no-unused-vars */
const logger = require('@scandipwa/common-dev-utils/logger');
const { execAsyncSpawn } = require('../../util/exec-async-command');
const safeRegexExtract = require('../../util/safe-regex-extract');

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const checkPhpbrew = {
    title: 'Checking phpbrew',
    task: async (ctx, task) => {
        const { result, code } = await execAsyncSpawn('phpbrew --version', {
            withCode: true
        });

        if (code !== 0) {
            throw new Error(
                `To install PHPBrew, you must first make sure the requirements are met.
            The requirements are available here: ${ logger.style.link('https://github.com/phpbrew/phpbrew/wiki/Requirement') }.
            Then, you can follow the installation instruction, here: ${ logger.style.link('https://phpbrew.github.io/phpbrew/#installation') }.
            When completed, try running this script again.`
            );
        }

        const phpBrewVersion = safeRegexExtract({
            string: result,
            regex: /phpbrew - ([\d.]+)/i,
            onNoMatch: () => {
                throw new Error(`No phpbrew version found in phpbrew version output!\n\n${result}`);
            }
        });

        ctx.phpBrewVersion = phpBrewVersion;
        task.title = `Using PHPBrew version ${phpBrewVersion}`;
    }
};

module.exports = checkPhpbrew;
