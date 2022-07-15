const { deepmerge } = require('../../util/deepmerge');
const { runContainer } = require('../docker/containers');

/**
 *
 * @param {import('../../../typings/context').ListrContext} ctx
 * @param {import('../../util/exec-async-command').ExecAsyncSpawnOptions<false> & { useXDebugContainer?: boolean }} [options]
 * @param {string} command
 */
const runPHPContainerCommand = (ctx, command, options = {}) => {
    const { php } = ctx.config.docker.getContainers(ctx.ports);

    return runContainer(
        deepmerge(
            php,
            options.useXDebugContainer
                ? {
                    imageDetails: {
                        tag: `${php.imageDetails.tag}.xdebug`
                    }
                }
                : {},
            {
                command,
                env: {
                    COMPOSER_AUTH: process.env.COMPOSER_AUTH
                }
            }
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
    task: (ctx, task) => {
        const { php } = ctx.config.docker.getContainers(ctx.ports);

        return runContainer(
            deepmerge(
                php,
                options.useXDebugContainer
                    ? {
                        imageDetails: {
                            tag: `${php.imageDetails.tag}.xdebug`
                        }
                    }
                    : {},
                {
                    command,
                    env: {
                        COMPOSER_AUTH: process.env.COMPOSER_AUTH
                    }
                }
            ), {
                callback: !ctx.verbose ? undefined : (t) => {
                    task.output = t;
                },
                ...options
            }
        );
    },
    option: {
        bottomBar: 10
    }
});

module.exports = {
    runPHPContainerCommand,
    runPHPContainerCommandTask
};
