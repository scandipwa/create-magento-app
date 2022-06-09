const path = require('path');
const pathExists = require('../../util/path-exists');
const phpTask = require('../../util/php-task');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const updateEnvPHP = () => ({
    title: 'Updating env.php',
    task: async (ctx, task) => {
        // update env.php only if it's exist
        if (!await pathExists(path.join(process.cwd(), 'app', 'etc', 'env.php'))) {
            task.skip();
            return;
        }

        const useVarnish = ctx.config.overridenConfiguration.configuration.varnish.enabled ? '1' : '';
        const varnishHost = '127.0.0.1';
        const varnishPort = ctx.ports.varnish;
        const previousVarnishPort = ctx.cachedPorts
            ? ctx.cachedPorts.varnish
            : ctx.cachedPorts;

        return task.newListr(
            phpTask(`-f ${ path.join(__dirname, 'update-env.php') }`, {
                noTitle: true,
                env: {
                    USE_VARNISH: useVarnish,
                    VARNISH_PORT: `${ varnishPort }`,
                    VARNISH_HOST: varnishHost,
                    PREVIOUS_VARNISH_PORT: `${ previousVarnishPort }`
                }
            })
        );
    }
});

module.exports = updateEnvPHP;
