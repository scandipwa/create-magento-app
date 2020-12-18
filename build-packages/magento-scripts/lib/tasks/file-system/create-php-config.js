const path = require('path');
const { config } = require('../../config');
const setConfigFile = require('../../util/set-config');

const createPhpConfig = {
    title: 'Setting PHP config',
    task: async ({ config: { php }, debug, ports }) => {
        try {
            await setConfigFile({
                configPathname: php.iniPath,
                template: path.join(config.templateDir, debug ? 'php.xdebug.template.ini' : 'php.template.ini'),
                ports,
                overwrite: true
            });
        } catch (e) {
            throw new Error(`Unexpected error accrued during php.ini config creation\n\n${e}`);
        }
    }
};

module.exports = createPhpConfig;
