const path = require('path');
const setConfigFile = require('../../util/set-config');
const { composerConfig } = require('../../config/composer-config');

const createComposerConfig = {
    title: 'Setting composer.json',
    task: async ({ config: { config }, magentoVersion }) => {
        try {
            await setConfigFile({
                configPathname: path.join(config.magentoDir, 'composer.json'),
                template: path.join(config.templateDir, 'composer.template.json'),
                overwrite: true,
                templateArgs: {
                    composer: composerConfig[magentoVersion]
                }
            });
        } catch (e) {
            throw new Error(`Unexpected error accrued during composer.json config creation\n\n${e}`);
        }
    }
};

module.exports = createComposerConfig;
