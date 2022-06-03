// const path = require('path');
const { spawn } = require('child_process');

const executeInContainer = ({ containerName, commands }) => {
    if (!process.stdin.isTTY) {
        process.stderr.write('This app works only in TTY mode');
        process.exit(1);
    }

    spawn('docker', [
        'exec',
        '-it',
        containerName
    ].concat(...commands.map((command) => command.split(' '))), {
        stdio: [0, 1, 2]
    });

    return new Promise((_resolve) => {
        // never resolve
    });
};

module.exports = executeInContainer;
