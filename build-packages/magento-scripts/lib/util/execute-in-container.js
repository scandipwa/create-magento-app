const { spawn } = require('child_process')
const {
    execCommand,
    runCommand
} = require('../tasks/docker/containers/container-api')

/**
 * @param {{ containerName: string, commands: string[], user?: string, env?: Record<string, string> }} param0
 */
const executeInContainer = ({ containerName, commands, user, env }) => {
    const [commandBin, ...commandsArgs] = commands

    const isTTY = process.stdin.isTTY

    const execArgs = execCommand({
        container: containerName,
        command: commandBin,
        user,
        tty: isTTY,
        interactive: isTTY,
        env: env || {}
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
    const isTTY = process.stdin.isTTY
    const [commandBin, ...commandsArgs] = commands

    const runArgs = runCommand({
        ...options,
        command: commandBin,
        tty: isTTY,
        detach: false,
        rm: true
    })

    const [cmd, ...args] = runArgs

    const child = spawn(cmd, [...args, ...commandsArgs], {
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
