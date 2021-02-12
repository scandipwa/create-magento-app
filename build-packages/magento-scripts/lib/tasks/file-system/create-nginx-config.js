const path = require('path');
const { baseConfig } = require('../../config');
const setConfigFile = require('../../util/set-config');
const macosVersion = require('macos-version');

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
            }
        } = overridenConfiguration;

        try {
            await setConfigFile({
                configPathname: path.join(
                    baseConfig.cacheDir,
                    'nginx',
                    'conf.d',
                    'default.conf'
                ),
                dirName: path.join(
                    baseConfig.cacheDir,
                    'nginx',
                    'conf.d'
                ),
                template: nginx.configTemplate,
                ports,
                overwrite: true,
                templateArgs: {
                    mageRoot: baseConfig.magentoDir,
                    hostMachine: macosVersion.isMacOS ? 'host.docker.internal' : '127.0.0.1',
                    hostPort: macosVersion.isMacOS ? 80 : ports.app,
                    config: overridenConfiguration
                }
            });
        } catch (e) {
            throw new Error(`Unexpected error accrued during nginx config creation\n\n${e}`);
        }
    }
};

module.exports = createNginxConfig;
