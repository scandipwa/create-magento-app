const { execAsyncSpawn } = require('../../util/exec-async-command');
const getPhpConfig = require('../../config/php');
const { getBaseConfig } = require('../../config/index');
const getProcessId = require('./get-process-id');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const startPhpFpm = () => ({
    title: 'Starting php-fpm',
    task: async ({ config: { overridenConfiguration }, projectPath }, task) => {
        const php = getPhpConfig(overridenConfiguration.configuration, getBaseConfig(projectPath));
        const processId = await getProcessId(php.fpmPidFilePath);
        if (processId) {
            task.skip();
            return;
        }
        const phpIniPathArg = `--php-ini ${php.iniPath}`;
        const phpFpmConfPathArg = `--fpm-config ${php.fpmConfPath}`;
        const phpFpmPidFilePathArg = `--pid ${php.fpmPidFilePath}`;

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
        bottomBar: 5,
        showTimer: false
    }
});

module.exports = startPhpFpm;
