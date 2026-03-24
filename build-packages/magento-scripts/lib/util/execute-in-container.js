const { spawn } = require('child_process')
const { execCommand, run, exec } = require('../tasks/docker/containers/container-api')

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
 * Non-interactive version of executeInContainer for AI terminals and scripts.
 * @param {{ containerName: string, commands: string[], user?: string, workdir?: string, env?: Record<string, string> }} param0
 * @returns {Promise<{ code: number, result: string }>}
 */
const executeInContainerNonInteractive = async ({
    containerName,
    commands,
    user,
    workdir,
    env
}) => {
    const [commandBin, ...commandsArgs] = commands

    return exec(
        {
            container: containerName,
            command: `${commandBin} ${commandsArgs.join(' ')}`,
            user,
            workdir,
            tty: false,
            interactive: false,
            env: env || {}
        },
        {
            withCode: true
        }
    )
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

/**
 * Non-interactive version of runInContainer for AI terminals and scripts.
 * @param {import('../tasks/docker/containers/container-api').ContainerRunOptions} options
 * @param {string[]} commands
 * @returns {Promise<{ code: number, result: string }>}
 */
const runInContainerNonInteractive = async (options, commands) => {
    const [commandBin, ...commandsArgs] = commands

    return run(
        {
            ...options,
            command: `${commandBin} ${commandsArgs.join(' ')}`,
            tty: false,
            detach: false,
            rm: true
        },
        {
            withCode: true
        }
    )
}

module.exports = {
    executeInContainer,
    executeInContainerNonInteractive,
    runInContainer,
    runInContainerNonInteractive
}
