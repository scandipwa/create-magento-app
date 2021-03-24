const path = require('path');
const { baseConfig } = require('../../config');
const setConfigFile = require('../../util/set-config');

/**
 * @type {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const createBashrcConfigFile = {
    title: 'Setting Bashrc config',
    task: async ({ config: { php } }) => {
        try {
            await setConfigFile({
                configPathname: path.join(baseConfig.cacheDir, '.magentorc'),
                template: path.join(baseConfig.templateDir, 'magentorc.template'),
                overwrite: true,
                templateArgs: {
                    php
                }
            });
        } catch (e) {
            throw new Error(`Unexpected error accrued during php.ini config creation\n\n${e}`);
        }
    }
};

module.exports = createBashrcConfigFile;
