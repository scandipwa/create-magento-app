const os = require('os');
const path = require('path');
const fs = require('fs');
const setConfigFile = require('../../util/set-config');
const pathExists = require('../../util/path-exists');
const { isIpAddress } = require('../../util/ip');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const createSSLTerminatorConfig = () => ({
    title: 'Setting ssl terminator config',
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
                sslTerminator
            },
            ssl,
            host
        } = overridenConfiguration;

        if (ssl.enabled) {
            if (!(await pathExists(ssl.ssl_certificate))) {
                throw new Error('ssl.ssl_certificate file does not exist!');
            }
            if (!(await pathExists(ssl.ssl_certificate_key))) {
                throw new Error('ssl.ssl_certificate_key file does not exist!');
            }

            const nginxCacheDir = path.join(baseConfig.cacheDir, 'nginx', 'conf.d');
            if (!await pathExists(nginxCacheDir)) {
                await fs.promises.mkdir(nginxCacheDir, { recursive: true });
            }

            await fs.promises.copyFile(
                ssl.ssl_certificate,
                path.join(
                    baseConfig.cacheDir,
                    'ssl-terminator',
                    'conf.d',
                    'ssl_certificate.pem'
                )
            );
            await fs.promises.copyFile(
                ssl.ssl_certificate_key,
                path.join(
                    baseConfig.cacheDir,
                    'ssl-terminator',
                    'conf.d',
                    'ssl_certificate-key.pem'
                )
            );
        }

        const networkToBindTo = isIpAddress(host) ? host : '127.0.0.1';
        const isLinux = os.platform() === 'linux';
        const isNativeLinux = isLinux && !isWsl;
        const hostMachine = isNativeLinux ? '127.0.0.1' : 'host.docker.internal';
        const hostPort = isNativeLinux ? ports.sslTerminator : 80;

        try {
            await setConfigFile({
                configPathname: path.join(
                    baseConfig.cacheDir,
                    'ssl-terminator',
                    'conf.d',
                    'default.conf'
                ),
                template: sslTerminator.configTemplate,
                overwrite: true,
                templateArgs: {
                    ports,
                    hostMachine,
                    hostPort,
                    config: overridenConfiguration,
                    networkToBindTo
                }
            });
        } catch (e) {
            throw new Error(`Unexpected error accrued during ssl terminator config creation\n\n${e}`);
        }
    }
});

module.exports = createSSLTerminatorConfig;
