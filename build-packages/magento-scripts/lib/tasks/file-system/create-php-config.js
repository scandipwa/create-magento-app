const { baseConfig } = require('../../config');
const setConfigFile = require('../../util/set-config');

const createPhpConfig = {
    title: 'Setting PHP config',
    task: async ({ config: { php }, debug, ports }) => {
        try {
            await setConfigFile({
                configPathname: php.iniPath,
                template: php.iniTemplatePath,
                ports,
                overwrite: true,
                templateArgs: {
                    debug,
                    mageRoot: baseConfig.magentoDir
                }
            });
        } catch (e) {
            throw new Error(`Unexpected error accrued during php.ini config creation\n\n${e}`);
        }
    }
};

module.exports = createPhpConfig;
