const os = require('os');
const path = require('path');
const setConfigFile = require('../../util/set-config');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const createVarnishConfig = () => ({
    title: 'Setting Varnish config',
    skip: (ctx) => !ctx.config.overridenConfiguration.configuration.varnish.enabled,
    task: async (ctx) => {
        const {
            ports,
            config: {
                overridenConfiguration,
                baseConfig: {
                    cacheDir
                }
            },
            isWsl
        } = ctx;

        const {
            configuration: {
                varnish
            }
        } = overridenConfiguration;

        const isLinux = os.platform() === 'linux';

        try {
            await setConfigFile({
                configPathname: path.join(
                    cacheDir,
                    'varnish',
                    'default.vcl'
                ),
                template: varnish.configTemplate,
                overwrite: true,
                templateArgs: {
                    hostMachine: (isLinux && !isWsl) ? '127.0.0.1' : 'host.docker.internal',
                    hostPort: (isLinux && !isWsl) ? ports.app : 80
                }
            });
        } catch (e) {
            throw new Error(`Unexpected error accrued during varnish config creation\n\n${e}`);
        }
    }
});

module.exports = createVarnishConfig;
