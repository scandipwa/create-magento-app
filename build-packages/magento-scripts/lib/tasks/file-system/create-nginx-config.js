const os = require('os');
const path = require('path');
const setConfigFile = require('../../util/set-config');
const UnknownError = require('../../errors/unknown-error');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const createNginxConfig = () => ({
    title: 'Setting nginx config',
    task: async (ctx) => {
        const {
            ports,
            config: {
                overridenConfiguration,
                baseConfig
            },
            isWsl
        } = ctx;

        const {
            configuration: {
                nginx
            }
        } = overridenConfiguration;

        const isLinux = os.platform() === 'linux';
        const isNativeLinux = isLinux && !isWsl;
        const hostMachine = isNativeLinux ? '127.0.0.1' : 'host.docker.internal';
        const hostPort = isNativeLinux ? ports.app : 80;

        try {
            await setConfigFile({
                configPathname: path.join(
                    baseConfig.cacheDir,
                    'nginx',
                    'conf.d',
                    'default.conf'
                ),
                template: nginx.configTemplate,
                overwrite: true,
                templateArgs: {
                    ports,
                    mageRoot: baseConfig.magentoDir,
                    hostMachine,
                    hostPort,
                    config: overridenConfiguration
                }
            });
        } catch (e) {
            throw new UnknownError(`Unexpected error accrued during nginx config creation\n\n${e}`);
        }
    }
});

module.exports = createNginxConfig;
