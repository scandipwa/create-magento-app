const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { exec, spawn } = require('child_process');

const execAsync = (command, options) => new Promise((resolve, reject) => {
    exec(command, options, (err, stdout) => (err ? reject(err) : resolve(stdout)));
});

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

const execCommandTask = (command, options = {}) => ({
    title: `Running command "${command}"`,
    task: (ctx, task) => execAsyncSpawn(command, {
        callback: !ctx.verbose ? undefined : (t) => {
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
    execAsyncSpawn,
    execCommandTask
};
