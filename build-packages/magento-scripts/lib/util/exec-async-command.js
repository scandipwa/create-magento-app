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
 * @param {Boolean} param1.pipeInput
 * @param {String} param1.cwd
 * @param {(str: string) => void} param1.callback
 * @returns {Promise<string>}
 */
const execAsyncSpawn = (command, {
    callback = () => {},
    pipeInput,
    logOutput = false,
    cwd,
    withCode = false
} = {}) => {
    const childProcess = spawn(
        'bash',
        ['-c', command],
        {
            stdio: pipeInput ? ['inherit', 'pipe', 'pipe'] : 'pipe',
            cwd
        }
    );

    return new Promise((resolve, reject) => {
        let stdout = '';

        /**
         * @param {Buffer} data
         */
        function addLine(data) {
            stdout += data.toString();
            data.toString().split('\n').map((str) => str.trim()).forEach((str) => {
                callback(str);
            });
            if (logOutput) {
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
 * @param {String} command Bash command
 * @param {Object} options
 * @param {Boolean} options.logOutput Log output to console using logger
 * @param {Boolean} options.withCode
 * @param {Boolean} options.pipeInput
 * @param {String} options.cwd
 * @param {(str: string) => void} options.callback
 * @returns {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const execCommandTask = (command, options = {}) => ({
    title: `Running command "${command}"`,
    task: (ctx, task) => execAsyncSpawn(command, {
        throwNonZeroCode: true,
        callback: (t) => {
            task.output = t;
        },
        ...options
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
