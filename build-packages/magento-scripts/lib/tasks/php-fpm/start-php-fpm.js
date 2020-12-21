/* eslint-disable no-param-reassign */
const { execAsyncSpawn } = require('../../util/exec-async-command');

const startPhpFpm = {
    title: 'Starting php-fpm',
    task: async ({ config: { php } }, task) => {
        const phpIniPathArg = `--php-ini ${php.iniPath}`;
        const phpFpmConfPathArg = `--fpm-config ${php.fpmConfPath}`;
        const phpFpmPidFilePathArg = `--pid ${php.fpmPidFilePath}`;
        // const phpFpmXdebugArg = 'export XDEBUG_SESSION=PHPSTORM';

        const command = [
            phpIniPathArg,
            phpFpmConfPathArg,
            phpFpmPidFilePathArg
        ].filter(Boolean);

        try {
            await execAsyncSpawn(
                `${php.fpmBinPath} ${command.join(' ')} "$@"`,
                {
                    callback: (t) => {
                        task.output = t;
                    }
                }
            );
        } catch (e) {
            throw new Error(`Error during php-fpm start\n\n${e}`);
        }
    },
    options: {
        bottomBar: 5
    }
};

module.exports = startPhpFpm;
