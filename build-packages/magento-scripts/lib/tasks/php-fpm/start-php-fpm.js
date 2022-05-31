const { execAsyncSpawn } = require('../../util/exec-async-command');
const getPhpConfig = require('../../config/php-config');
const { getBaseConfig } = require('../../config/index');
const getProcessId = require('./get-process-id');
const UnknownError = require('../../errors/unknown-error');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const startPhpFpm = () => ({
    title: 'Starting PHP-FPM',
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
                    },
                    useRosetta2: true
                }
            );
        } catch (e) {
            throw new UnknownError(`Error during PHP-FPM start\n\n${e}`);
        }
    },
    options: {
        bottomBar: 5,
        showTimer: false
    }
});

module.exports = startPhpFpm;
