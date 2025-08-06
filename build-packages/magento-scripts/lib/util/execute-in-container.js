const { spawn } = require('child_process')
const {
    runCommand,
    execCommand
} = require('../tasks/docker/containers/container-api')

/**
 * @param {{ containerName: string, commands: string[], user?: string }} param0
 */
const executeInContainer = ({ containerName, commands, user }) => {
    if (!process.stdin.isTTY) {
        process.stderr.write('This app works only in TTY mode')
        process.exit(1)
    }
    const [commandBin, ...commandsArgs] = commands

    const execArgs = execCommand({
        container: containerName,
        command: commandBin,
        user,
        tty: true,
        interactive: true
    })
    const [command, ...args] = execArgs

    const child = spawn(command, [...args, ...commandsArgs], {
        stdio: 'inherit'
    })

    child.on('close', (code) => {
        process.exit(code)
    })
}

/**
 * @param {import('../tasks/docker/containers/container-api').ContainerRunOptions} options
 * @param {string[]} commands
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
        rm: true
    })

    const [commandBin, ...commandsArgs] = commands

    const [command, ...args] = runArgs

    const child = spawn(command, [...args, commandBin, ...commandsArgs], {
        stdio: 'inherit'
    })

    child.on('close', (code) => {
        process.exit(code)
    })
}

module.exports = {
    executeInContainer,
    runInContainer
}
