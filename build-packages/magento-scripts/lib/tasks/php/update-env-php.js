const path = require('path');
const envPhpToJson = require('../../util/env-php-json');
const getJsonfileData = require('../../util/get-jsonfile-data');
const pathExists = require('../../util/path-exists');
const phpTask = require('../../util/php-task');

const composerLockPath = path.join(process.cwd(), 'composer.lock');
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

        let SETUP_PQ = '1';

        if (await pathExists(composerLockPath)) {
            const composerLockData = await getJsonfileData(composerLockPath);

            if (composerLockData.packages.some(({ name }) => name === 'scandipwa/persisted-query')) {
                if (typeof ctx.CSAThemeInstalled !== 'boolean') {
                    ctx.CSAThemeInstalled = true;
                }

                const envPhp = await envPhpToJson(process.cwd(), { magentoVersion: ctx.magentoVersion });

                const persistedQueryConfig = envPhp.cache && envPhp.cache['persisted-query'];

                if (
                    persistedQueryConfig
                    && persistedQueryConfig.redis
                    && persistedQueryConfig.redis.port === `${ ctx.ports.redis }`
                    && persistedQueryConfig.redis.host === 'localhost'
                ) {
                    SETUP_PQ = '';
                    return;
                }
            }
        }

        return task.newListr(
            phpTask(`-f ${ path.join(__dirname, 'update-env.php') }`, {
                noTitle: true,
                env: {
                    USE_VARNISH: useVarnish,
                    VARNISH_PORT: `${ varnishPort }`,
                    VARNISH_HOST: varnishHost,
                    PREVIOUS_VARNISH_PORT: `${ previousVarnishPort }`,
                    SETUP_PQ,
                    REDIS_PORT: ctx.ports.redis,
                    ADMIN_URI: ctx.config.overridenConfiguration.magento.adminuri
                }
            })
        );
    }
});

module.exports = updateEnvPHP;
