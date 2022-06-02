const os = require('os');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { spawn } = require('child_process');
const { getArchSync } = require('./arch');
const compileOptions = require('../tasks/php/compile-options');

const execAsyncSpawn = (command, {
    callback = () => {},
    pipeInput,
    logOutput = false,
    cwd,
    withCode = false,
    useRosetta2 = false
} = {}) => {
    const spawnOptions = {
        stdio: pipeInput ? ['inherit', 'pipe', 'pipe'] : 'pipe',
        cwd
    };
    let childProcess;
    if (useRosetta2 && os.platform() === 'darwin' && getArchSync() === 'arm64') {
        childProcess = spawn(
            'arch',
            // eslint-disable-next-line max-len
            ['-x86_64', 'bash', '-c', command],
            {
                ...spawnOptions,
                env: {
                    ...process.env,
                    PATH: compileOptions.darwin.env.PATH
                }
            }
        );
    } else {
        childProcess = spawn(
            'bash',
            ['-c', command],
            spawnOptions
        );
    }

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
    execAsyncSpawn,
    execCommandTask
};
