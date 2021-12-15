const fs = require('fs');
const { execAsyncSpawn } = require('../../util/exec-async-command');
const pathExists = require('../../util/path-exists');
const getPhpConfig = require('../../config/php-config');
const { getBaseConfig } = require('../../config/index');
const getProcessId = require('./get-process-id');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const stopPhpFpmTask = () => ({
    title: 'Stopping PHP-FPM',
    task: async ({ config: { overridenConfiguration }, projectPath }, task) => {
        const php = getPhpConfig(overridenConfiguration.configuration, getBaseConfig(projectPath));
        const processId = await getProcessId(php.fpmPidFilePath);
        if (!processId) {
            task.skip();
            return;
        }
        try {
            await execAsyncSpawn(`kill ${processId}`);
        } catch (e) {
            if (e.toLowerCase().includes('no such process')) {
                try {
                    await fs.promises.unlink(php.fpmPidFilePath);
                } catch (e) {
                    //
                }

                return;
            }
        }

        if (await pathExists(php.fpmPidFilePath)) {
            try {
                await fs.promises.unlink(php.fpmPidFilePath);
            } catch (e) {
                //
            }
        }
    },
    options: {
        bottomBar: 10,
        showTimer: false
    }
});

module.exports = stopPhpFpmTask;
