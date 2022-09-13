const os = require('os');
const { spawn } = require('child_process');
const { runCommand } = require('../tasks/docker/containers/container-api');

/**
 * @param {{ containerName: string, commands: string[], isDockerDesktop: boolean }} param0
 */
const executeInContainer = ({ containerName, commands, isDockerDesktop }) => {
    if (!process.stdin.isTTY) {
        process.stderr.write('This app works only in TTY mode');
        process.exit(1);
    }

    const userArg = ((os.platform() === 'linux' && isDockerDesktop) || !isDockerDesktop) && `--user=${os.userInfo().uid}:${os.userInfo().gid}`;

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

/**
 * @param {import('../tasks/docker/containers/container-api').ContainerRunOptions} options
 * @param {string[]} commands
 */
const runInContainer = (options, commands) => {
    if (!process.stdin.isTTY) {
        process.stderr.write('This app works only in TTY mode');
        process.exit(1);
    }

    const runArgs = runCommand({
        ...options,
        tty: true,
        detach: false,
        rm: true,
        command: commands.join(' ')
    });

    spawn('bash', ['-c', runArgs.join(' ')], { stdio: [0, 1, 2] });

    return new Promise((_resolve) => {
        // never resolve
    });
};

module.exports = {
    executeInContainer,
    runInContainer
};
