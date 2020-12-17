/* eslint-disable no-param-reassign */
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { execAsyncSpawn } = require('../../util/exec-async-command');

const checkPhpbrew = {
    title: 'Checking phpbrew',
    task: async (ctx, task) => {
        const { code, result } = await execAsyncSpawn('phpbrew --version', {
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

        const phpBrewVersion = result.match(/phpbrew - ([\d.]+)/i)[1];

        ctx.phpBrewVersion = phpBrewVersion;
        task.title = `Using PHPBrew version ${phpBrewVersion}`;
    }
};

module.exports = checkPhpbrew;
