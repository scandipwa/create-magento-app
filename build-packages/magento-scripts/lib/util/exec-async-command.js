/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { exec, spawn } = require('child_process');

/**
 * Execute bash command
 * @param {String} command Bash command
 * @param {Object} options Child process exec options ([docs](https://nodejs.org/dist/latest-v14.x/docs/api/child_process.html#child_process_child_process_exec_command_options_callback))
 * @returns {Promise<String>}
 */
const execAsync = (command, options) => new Promise((resolve, reject) => {
    exec(command, options, (err, stdout) => (err ? reject(err) : resolve(stdout)));
});

/**
 * Execute bash command in child process
 * @param {String} command Bash command
 * @param {Object} param1
 * @param {Boolean} param1.logOutput Log output to console using logger
 * @param {Boolean} param1.withCode
 * @param {String} param1.cwd
 * @param {() => {}} param1.callback
 * @returns {Promise<string>}
 */
const execAsyncSpawn = (command, {
    callback = () => {},
    logOutput = false,
    cwd,
    withCode = false
} = {}) => {
    const childProcess = spawn(
        'bash',
        ['-c', command],
        {
            stdio: 'pipe',
            cwd
        }
    );

    return new Promise((resolve, reject) => {
        let stdout = '';
        function addLine(data) {
            stdout += data;
            data.toString().split().map((str) => str.trim()).forEach((str) => {
                callback(str);
            });
            if (logOutput && verbose) {
                data.toString().split('\n').filter(Boolean).forEach((line) => {
                    logger.log(line);
                });
            }
        }
        childProcess.stdout.on('data', addLine);
        childProcess.stderr.on('data', addLine);
        childProcess.on('error', (error) => {
            reject(error);
        });
        childProcess.on('close', (code) => {
            if (withCode) {
                resolve({ code, result: stdout.trim() });
                return;
            }
            if (code > 0) {
                reject(stdout.trim());
            } else {
                resolve(stdout.trim());
            }
        });
    });
};

const execAsyncBool = async (command, options) => {
    const result = await execAsync(command, options);
    if (result.toString().trim() === '1') {
        throw new Error('');
    }
};

/**
 * @type {(command: string[]) => import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const execCommandTask = (command) => ({
    title: `Running command "${command}"`,
    task: (ctx, task) => execAsyncSpawn(command, {
        throwNonZeroCode: true,
        callback: (t) => {
            task.output = t;
        }
    }),
    option: {
        bottomBar: 10
    }
});

module.exports = {
    execAsync,
    execAsyncBool,
    execAsyncSpawn,
    execCommandTask
};
