/* eslint-disable no-use-before-define */
const { deepmerge } = require('../../util/deepmerge');
const { containerApi } = require('../docker/containers');

/**
 * @param {import('../../../typings/context').ListrContext} ctx
 * @param {import('../../util/exec-async-command').ExecAsyncSpawnOptions<false> & { useXDebugContainer?: boolean }} [options]
 * @param {string} command
 */
const runPHPContainerCommand = async (ctx, command, options = {}) => {
    const { php } = ctx.config.docker.getContainers(ctx.ports);

    const containers = await containerApi.ls({ formatToJSON: true, all: true });

    if (containers.some((c) => c.Names === php.name)) {
        return execPHPContainerCommand(ctx, command, options);
    }

    return containerApi.run(
        deepmerge(
            php,
            {
                detach: false,
                rm: true
            },
            options.useXDebugContainer
                ? {
                    image: `${ php.image }.xdebug`
                }
                : {},
            {
                command
            },
        ),
        options
    );
};

/**
 * @param {string} command
 * @param {import('../../util/exec-async-command').ExecAsyncSpawnOptions<false> & { useXDebugContainer?: boolean }} [options]
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const runPHPContainerCommandTask = (command, options = {}) => ({
    title: `Running command "${command}"`,
    task: (ctx, task) => runPHPContainerCommand(ctx, command, {
        callback: !ctx.verbose ? undefined : (t) => {
            task.output = t;
        },
        ...options
    }),
    option: {
        bottomBar: 10
    }
});

/**
 *
 * @param {import('../../../typings/context').ListrContext} ctx
 * @param {import('../../util/exec-async-command').ExecAsyncSpawnOptions<false> & { useXDebugContainer?: boolean }} [options]
 * @param {string} command
 */
const execPHPContainerCommand = async (ctx, command, options = {}) => {
    const { php } = ctx.config.docker.getContainers(ctx.ports);

    const containers = await containerApi.ls({ formatToJSON: true, all: true });

    if (!containers.some((c) => c.Names === php.name)) {
        return runPHPContainerCommand(ctx, command, options);
    }

    return containerApi.exec(
        command,
        php.name,
        deepmerge(
            php,
            options.env ? {
                env: options.env
            } : {}
        ),
        options
    );
};

/**
 * @param {string} command
 * @param {import('../../util/exec-async-command').ExecAsyncSpawnOptions<false> & { useXDebugContainer?: boolean, title?: string }} [options]
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const execPHPContainerCommandTask = (command, options = {}) => ({
    title: typeof options.title === 'string' && options.title === '' ? undefined : options.title || `Running command "${command}"`,
    task: (ctx, task) => execPHPContainerCommand(ctx, command, {
        callback: !ctx.verbose ? undefined : (t) => {
            task.output = t;
        },
        ...options
    }),
    option: {
        bottomBar: 10
    }
});

module.exports = {
    runPHPContainerCommand,
    runPHPContainerCommandTask,
    execPHPContainerCommand,
    execPHPContainerCommandTask
};