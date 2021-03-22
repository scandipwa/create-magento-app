const path = require('path');
const fs = require('fs');
const { baseConfig } = require('../../config');
const setConfigFile = require('../../util/set-config');
const macosVersion = require('macos-version');
const pathExists = require('../../util/path-exists');
const { isIpAddress } = require('../../util/ip');

const createNginxConfig = {
    title: 'Setting nginx config',
    task: async (ctx) => {
        const {
            ports,
            config: {
                overridenConfiguration
            }
        } = ctx;

        const {
            configuration: {
                nginx
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

            await fs.promises.copyFile(
                ssl.ssl_certificate,
                path.join(
                    baseConfig.cacheDir,
                    'nginx',
                    'conf.d',
                    'ssl_certificate.pem'
                )
            );
            await fs.promises.copyFile(
                ssl.ssl_certificate_key,
                path.join(
                    baseConfig.cacheDir,
                    'nginx',
                    'conf.d',
                    'ssl_certificate-key.pem'
                )
            );
        }

        const networkToBindTo = isIpAddress(host) ? host : '127.0.0.1';

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
                    hostMachine: macosVersion.isMacOS ? 'host.docker.internal' : '127.0.0.1',
                    hostPort: macosVersion.isMacOS ? 80 : ports.app,
                    config: overridenConfiguration,
                    networkToBindTo
                }
            });
        } catch (e) {
            throw new Error(`Unexpected error accrued during nginx config creation\n\n${e}`);
        }
    }
};

module.exports = createNginxConfig;
