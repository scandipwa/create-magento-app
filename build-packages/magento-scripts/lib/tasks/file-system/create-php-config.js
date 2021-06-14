const setConfigFile = require('../../util/set-config');

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const createPhpConfig = {
    title: 'Setting PHP config',
    task: async ({ config: { php, baseConfig }, debug, ports }) => {
        try {
            await setConfigFile({
                configPathname: php.iniPath,
                template: php.iniTemplatePath,
                overwrite: true,
                templateArgs: {
                    ports,
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
