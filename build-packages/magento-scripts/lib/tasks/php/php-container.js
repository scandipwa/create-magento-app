/* eslint-disable no-use-before-define */
const os = require('os')
const { deepmerge } = require('../../util/deepmerge')
const { containerApi } = require('../docker/containers')

/**
 * @param {Parameters<typeof import('./php-container')['runPHPContainerCommand']>[0]} ctx
 * @param {Parameters<typeof import('./php-container')['runPHPContainerCommand']>[1]} command
 * @param {Parameters<typeof import('./php-container')['runPHPContainerCommand']>[2] & { useAutomaticUser?: boolean}} [options]
 */
const runPHPContainerCommand = async (ctx, command, options = {}) => {
    const { useAutomaticUser = true } = options
    const { php } = ctx.config.docker.getContainers(ctx.ports)

    const containers = await containerApi.ls({
        formatToJSON: true,
        all: true,
        filter: `name=${php.name}`
    })

    if (containers.length > 0) {
        return execPHPContainerCommand(ctx, command, options)
    }

    return containerApi.run(
        deepmerge(
            php,
            {
                detach: false,
                rm: true,
                command
            },
            useAutomaticUser && ctx.platform === 'linux'
                ? {
                      user: `${os.userInfo().username}:${
                          os.userInfo().username
                      }`
                  }
                : {},
            options.user
                ? {
                      user: options.user
                  }
                : {}
        ),
        options
    )
}

/**
 * @type {typeof import('./php-container')['runPHPContainerCommandTask']}
 */
const runPHPContainerCommandTask = (command, options = {}) => ({
    title: `Running command "${command}"`,
    task: (ctx, task) =>
        runPHPContainerCommand(ctx, command, {
            callback: !ctx.verbose
                ? undefined
                : (t) => {
                      task.output = t
                  },
            ...options
        }),
    options: {
        bottomBar: 10
    }
})

/**
 * @type {typeof import('./php-container')['execPHPContainerCommand']}
 */
const execPHPContainerCommand = async (ctx, command, options = {}) => {
    const { php } = ctx.config.docker.getContainers(ctx.ports)

    const containers = await containerApi.ls({ formatToJSON: true, all: true })

    if (!containers.some((c) => c.Names === php.name)) {
        return runPHPContainerCommand(ctx, command, options)
    }

    return containerApi.exec(
        {
            container: php.name,
            ...deepmerge(php, options.env ? { env: options.env } : {}),
            command,
            ...(options.user ? { user: options.user } : {})
        },
        options
    )
}

/**
 * @param {string} command
 * @param {import('../../util/exec-async-command').ExecAsyncSpawnOptions<false> & { title?: string }} [options]
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const execPHPContainerCommandTask = (command, options = {}) => ({
    title:
        typeof options.title === 'string' && options.title === ''
            ? undefined
            : options.title || `Running command "${command}"`,
    task: (ctx, task) =>
        execPHPContainerCommand(ctx, command, {
            callback: !ctx.verbose
                ? undefined
                : (t) => {
                      task.output = t
                  },
            ...options
        }),
    options: {
        bottomBar: 10
    }
})

module.exports = {
    runPHPContainerCommand,
    runPHPContainerCommandTask,
    execPHPContainerCommand,
    execPHPContainerCommandTask
}
