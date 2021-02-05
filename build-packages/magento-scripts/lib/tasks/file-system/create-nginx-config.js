const path = require('path');
const { baseConfig } = require('../../config');
const setConfigFile = require('../../util/set-config');
const macosVersion = require('macos-version');

const createNginxConfig = {
    title: 'Setting nginx config',
    task: async ({ ports }) => {
        try {
            await setConfigFile({
                configPathname: path.join(baseConfig.cacheDir, 'nginx', 'conf.d', 'default.conf'),
                dirName: path.join(baseConfig.cacheDir, 'nginx', 'conf.d'),
                template: path.join(baseConfig.templateDir, 'nginx.template.conf'),
                ports,
                overwrite: true,
                templateArgs: {
                    mageRoot: baseConfig.magentoDir,
                    hostMachine: macosVersion.isMacOS ? 'host.docker.internal' : '127.0.0.1',
                    hostPort: macosVersion.isMacOS ? 80 : ports.app
                }
            });
        } catch (e) {
            throw new Error(`Unexpected error accrued during nginx config creation\n\n${e}`);
        }
    }
};

module.exports = createNginxConfig;
