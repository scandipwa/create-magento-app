const path = require('path');
const setConfigFile = require('../../util/set-config');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const createBashrcConfigFile = () => ({
    title: 'Setting Bashrc config',
    task: async (ctx) => {
        const { config: { php, baseConfig, overridenConfiguration } } = ctx;
        const varnishEnabled = overridenConfiguration.configuration.varnish.enabled;
        try {
            await setConfigFile({
                configPathname: path.join(baseConfig.cacheDir, '.magentorc'),
                template: path.join(baseConfig.templateDir, 'magentorc.template'),
                overwrite: true,
                templateArgs: {
                    php,
                    varnishEnabled
                }
            });
        } catch (e) {
            throw new Error(`Unexpected error accrued during php.ini config creation\n\n${e}`);
        }
    }
});

module.exports = createBashrcConfigFile;
