const fs = require('fs');
const { execAsyncSpawn } = require('../../util/exec-async-command');
const pathExists = require('../../util/path-exists');
const getPhpConfig = require('../../config/php');
const { getBaseConfig } = require('../../config/index');

const getProcessId = async (fpmPidFilePath) => {
    const pidExists = await pathExists(fpmPidFilePath);

    if (pidExists) {
        return fs.promises.readFile(fpmPidFilePath, 'utf-8');
    }

    return null;
};

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const stopPhpFpmTask = {
    title: 'Stopping php-fpm',
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
        bottomBar: 10
    }
};

module.exports = stopPhpFpmTask;
