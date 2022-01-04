const { spawn } = require('child_process');

/**
 * @param {string} command
 * @param {*} param1
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
                    console.log(line);
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

module.exports = execAsyncSpawn;
