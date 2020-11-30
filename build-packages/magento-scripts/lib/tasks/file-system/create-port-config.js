const path = require('path');
const { config } = require('../../config');
const setConfigFile = require('../../util/set-config');

const createPortConfig = {
    title: 'Setting port config',
    task: async ({ ports }) => {
        try {
            await setConfigFile({
                configPathname: path.join(config.cacheDir, 'port-config.json'),
                template: path.join(config.templateDir, 'port-config.template.json'),
                ports,
                overwrite: true
            });
        } catch (e) {
            throw new Error(`Unexpected error accrued during port config creation\n\n${e}`);
        }
    }
};

module.exports = createPortConfig;
