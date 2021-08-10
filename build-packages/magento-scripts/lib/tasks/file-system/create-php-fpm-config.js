const path = require('path');
const setConfigFile = require('../../util/set-config');

/**
 * @type {() => import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const createPhpFpmConfig = () => ({
    title: 'Setting php-fpm config',
    task: async ({ ports, config: { php, baseConfig } }) => {
        try {
            await setConfigFile({
                configPathname: php.fpmConfPath,
                template: path.join(baseConfig.templateDir, 'php-fpm.template.conf'),
                overwrite: true,
                templateArgs: {
                    ports
                }
            });
        } catch (e) {
            throw new Error(`Unexpected error accrued during php-fpm config creation\n\n${e}`);
        }
    }
});

module.exports = createPhpFpmConfig;
