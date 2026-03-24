const { spawn } = require('child_process')
const { execCommand, run } = require('../tasks/docker/containers/container-api')

/**
 * Escape an argument for use in a shell command string.
 * Wrap in single quotes and escape single quotes inside.
 * @param {string} arg
 * @returns {string}
 */
const shellEscapeArg = (arg) => "'" + String(arg).replace(/'/g, "'\\''") + "'"

/**
 * Join command args to survive shell re-parsing in `docker run`.
 * @param {string[]} args
 * @returns {string}
 */
const joinCommandArgs = (args) =>
    args.map((arg) => {
        const value = String(arg)
        return /[\s'"\\$`]/.test(value) ? shellEscapeArg(value) : value
    }).join(' ')

/**
 * @param {{ containerName: string, commands: string[], user?: string, env?: Record<string, string> }} param0
 */
const executeInContainer = ({ containerName, commands, user, env }) => {
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
        interactive: true,
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
const runInContainer = async (options, commands) => {
    if (!process.stdin.isTTY) {
        process.stderr.write('This app works only in TTY mode')
        process.exit(1)
    }

    const [commandBin, ...commandsArgs] = commands

    const runResult = await run(
        {
            ...options,
            command: joinCommandArgs([commandBin, ...commandsArgs]),
            tty: true,
            detach: false,
            rm: true
        },
        {
            withCode: true,
            pipeOutput: true
        }
    )

    process.exit(runResult.code)
}

module.exports = {
    executeInContainer,
    runInContainer
}
