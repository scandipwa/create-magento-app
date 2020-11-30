const path = require('path');
const { config } = require('../../config');
const setConfigFile = require('../../util/set-config');
const macosVersion = require('macos-version');

const createNginxConfig = {
    title: 'Setting nginx config',
    task: async ({ ports }) => {
        try {
            await setConfigFile({
                configPathname: path.join(config.cacheDir, 'nginx', 'conf.d', 'default.conf'),
                dirName: path.join(config.cacheDir, 'nginx', 'conf.d'),
                template: path.join(config.templateDir, 'nginx.template.conf'),
                ports,
                overwrite: true,
                templateArgs: {
                    mageRoot: config.magentoDir,
                    hostMachine: macosVersion.isMacOS ? 'host.docker.internal' : '127.0.0.1'
                }
            });
        } catch (e) {
            throw new Error(`Unexpected error accrued during nginx config creation\n\n${e}`);
        }
    }
};

module.exports = createNginxConfig;
