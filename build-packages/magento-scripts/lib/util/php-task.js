const runPhpCode = require('./run-php');

/**
 * @param {String} command
 * @param {{ noTitle: boolean, env: Record<string, string> }} options
 * @returns {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const phpTask = (command, options = {}) => ({
    title: !options.noTitle ? `Running command 'php ${command}` : undefined,
    task: (ctx, task) => runPhpCode(command, {
        callback: (t) => {
            task.output = t;
        },
        throwNonZeroCode: true,
        magentoVersion: ctx.magentoVersion,
        env: options.env,
        useRosettaOnMac: ctx.arch === 'arm64' && ctx.platform === 'darwin'
    })
});

module.exports = phpTask;
