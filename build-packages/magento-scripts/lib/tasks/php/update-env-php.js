const path = require('path');
const os = require('os');
const pathExists = require('../../util/path-exists');
const phpTask = require('../../util/php-task');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const updateEnvPHP = () => ({
    title: 'Updating env.php',
    task: async (ctx, task) => {
        // update env.php only if it's exist
        if (!await pathExists(path.resolve('app', 'etc', 'env.php'))) {
            task.skip();
            return;
        }

        const isLinux = os.platform() === 'linux';

        const useVarinsh = ctx.config.overridenConfiguration.configuration.varnish.enabled ? '1' : '';
        const varnishHost = (isLinux && !ctx.isWsl) ? '127.0.0.1' : 'host.docker.internal';
        const varnishPort = ctx.ports.varnish;

        return task.newListr(
            phpTask(`-f ${ path.join(__dirname, 'update-env.php') }`, {
                noTitle: true,
                env: {
                    USE_VARNISH: useVarinsh,
                    VARNISH_PORT: varnishPort,
                    VARNISH_HOST: varnishHost
                }
            })
        );
    }
});

module.exports = updateEnvPHP;
