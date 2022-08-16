const os = require('os');
const { spawn } = require('child_process');

/**
 * @param {{ containerName: string, commands: string[] }} param0
 */
const executeInContainer = ({ containerName, commands }) => {
    if (!process.stdin.isTTY) {
        process.stderr.write('This app works only in TTY mode');
        process.exit(1);
    }

    const userArg = os.platform() === 'linux' && `--user=${os.userInfo().uid}:${os.userInfo().gid}`;

    spawn('docker', [
        'exec',
        '-it',
        userArg,
        containerName
    ]
        .filter(Boolean)
        .concat(...commands.map((command) => command.split(' ')).flat()),
    {
        stdio: [0, 1, 2]
    });

    return new Promise((_resolve) => {
        // never resolve
    });
};

module.exports = executeInContainer;
