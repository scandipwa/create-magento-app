const { spawn } = require('child_process')
const {
    runCommand,
    execCommand
} = require('../tasks/docker/containers/container-api')

/**
 * @param {{ containerName: string, command: string, user?: string }} param0
 * @returns {Promise<never>}
 */
const executeInContainer = ({ containerName, command, user }) => {
    if (!process.stdin.isTTY) {
        process.stderr.write('This app works only in TTY mode')
        process.exit(1)
    }

    const execArgs = execCommand({
        container: containerName,
        command,
        user
    })

    spawn('bash', ['-c', execArgs.join(' ')], {
        stdio: [0, 1, 2]
    })

    return new Promise((_resolve) => {
        // never resolve
    })
}

/**
 * @param {import('../tasks/docker/containers/container-api').ContainerRunOptions} options
 * @param {string[]} commands
 * @returns {Promise<never>}
 */
const runInContainer = (options, commands) => {
    if (!process.stdin.isTTY) {
        process.stderr.write('This app works only in TTY mode')
        process.exit(1)
    }

    const runArgs = runCommand({
        ...options,
        tty: true,
        detach: false,
        rm: true,
        command: commands.join(' ')
    })

    spawn('bash', ['-c', runArgs.join(' ')], { stdio: [0, 1, 2] })

    return new Promise((_resolve) => {
        // never resolve
    })
}

module.exports = {
    executeInContainer,
    runInContainer
}
