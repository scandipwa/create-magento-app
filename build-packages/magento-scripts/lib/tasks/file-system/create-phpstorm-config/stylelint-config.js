const path = require('path');
const fs = require('fs');
const { loadXmlFile, buildXmlFile } = require('../../../config/xml-parser');
const pathExists = require('../../../util/path-exists');
const { valueKey, nameKey } = require('./keys');

const pathToStylelintConfig = path.join(process.cwd(), '.idea', 'stylesheetLinters', 'stylelint.xml');
const pathToStylelintConfigDir = path.parse(pathToStylelintConfig).dir;

const DEFAULT_STYLE_PATTERN = '{**/*,*}.{css,scss}';

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const setupStylelintConfig = () => ({
    title: 'Set up Stylelint configuration',
    task: async (ctx, task) => {
        if (await pathExists(pathToStylelintConfig)) {
            let hasChanges = false;
            const styleLintConfigurationData = await loadXmlFile(pathToStylelintConfig);

            if (styleLintConfigurationData.project.component && !Array.isArray(styleLintConfigurationData.project.component)) {
                hasChanges = true;
                styleLintConfigurationData.project.component = [styleLintConfigurationData.project.component];
            }

            const styleLintFilePatternsConfig = styleLintConfigurationData.project.component.find(
                (config) => config['file-patterns']
            );

            if (!styleLintFilePatternsConfig) {
                hasChanges = true;
                styleLintConfigurationData.project.component.push({
                    'file-patterns': {
                        [valueKey]: DEFAULT_STYLE_PATTERN
                    }
                });
            }

            if (hasChanges) {
                await buildXmlFile(pathToStylelintConfig, styleLintConfigurationData);
            } else {
                task.skip();
            }

            return;
        }

        if (!await pathExists(pathToStylelintConfigDir)) {
            await fs.promises.mkdir(pathToStylelintConfigDir, {
                recursive: true
            });
        }

        const styleLintConfigurationData = {
            '?xml': {
                '@_version': '1.0',
                '@_encoding': 'UTF-8'
            },
            project: {
                '@_version': '4',
                component: [
                    {
                        [nameKey]: 'StylelintConfiguration',
                        'file-patterns': {
                            [valueKey]: DEFAULT_STYLE_PATTERN
                        }
                    }
                ]
            }
        };

        await buildXmlFile(pathToStylelintConfig, styleLintConfigurationData);
    }
});

module.exports = setupStylelintConfig;
