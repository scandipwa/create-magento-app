const path = require('path');
const fs = require('fs');
const { loadXmlFile, buildXmlFile } = require('../../../config/xml-parser');
const pathExists = require('../../../util/path-exists');
const { valueKey, nameKey } = require('./keys');

const ESLINT_COMPONENT_NAME = 'EslintConfiguration';

const pathToESLintConfig = path.join(process.cwd(), '.idea', 'jsLinters', 'eslint.xml');
const pathToESLintConfigDir = path.parse(pathToESLintConfig).dir;

const defaultESLintComponentConfiguration = {
    [nameKey]: ESLINT_COMPONENT_NAME,
    option: {
        [nameKey]: 'fix-on-save',
        [valueKey]: 'true'
    }
};

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const setupESLintConfig = () => ({
    title: 'Set up ESLint configuration',
    task: async (ctx, task) => {
        if (await pathExists(pathToESLintConfig)) {
            let hasChanges = false;
            const esLintConfigurationData = await loadXmlFile(pathToESLintConfig);

            if (esLintConfigurationData.project.component && !Array.isArray(esLintConfigurationData.project.component)) {
                hasChanges = true;
                esLintConfigurationData.project.component = [esLintConfigurationData.project.component];
            }

            const esLintConfigurationComponent = esLintConfigurationData.project.component.find(
                (config) => config[nameKey] === ESLINT_COMPONENT_NAME
            );

            if (!esLintConfigurationComponent) {
                hasChanges = true;
                esLintConfigurationData.project.component.push(defaultESLintComponentConfiguration);
            }

            if (hasChanges) {
                await buildXmlFile(pathToESLintConfig, esLintConfigurationData);
            } else {
                task.skip();
            }

            return;
        }

        if (!await pathExists(pathToESLintConfigDir)) {
            await fs.promises.mkdir(pathToESLintConfigDir, {
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
                    defaultESLintComponentConfiguration
                ]
            }
        };

        await buildXmlFile(pathToESLintConfig, styleLintConfigurationData);
    }
});

module.exports = setupESLintConfig;
