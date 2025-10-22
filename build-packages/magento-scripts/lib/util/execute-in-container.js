const { spawn } = require('child_process')
const { execCommand, run } = require('../tasks/docker/containers/container-api')

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
const runInContainer = async (options, commands) => {
    if (!process.stdin.isTTY) {
        process.stderr.write('This app works only in TTY mode')
        process.exit(1)
    }

    const [commandBin, ...commandsArgs] = commands

    const runResult = await run(
        {
            ...options,
            command: `${commandBin} ${commandsArgs.join(' ')}`,
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
