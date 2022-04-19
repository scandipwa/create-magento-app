const path = require('path');
const { loadXmlFile, buildXmlFile } = require('../../../config/xml-parser');
const pathExists = require('../../../util/path-exists');

const excludeFoldersPaths = [
    'bin',
    'dev',
    'pub',
    'setup',
    'var/cache',
    'var/page_cache',
    'var/log'
].map((p) => `file://$MODULE_DIR$/${p}`);

const pathToModulesConfig = path.join(process.cwd(), '.idea', 'modules.xml');

// TODO probably need to find more elegant solution to resolve project config file path from xml
const getProjectConfigFilePath = (modulesConfigData) => modulesConfigData.find((c) => c.project)
    .project.find((c) => c.component)
    .component.find((c) => c.modules)
    .modules.find((c) => c[':@'])[':@']['@_filepath'].replace('$PROJECT_DIR$', process.cwd());

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const setupExcludedFoldersConfig = () => ({
    title: 'Set up excluded folders configuration',
    task: async () => {
        if (await pathExists(pathToModulesConfig)) {
            const modulesConfigData = await loadXmlFile(pathToModulesConfig);
            const projectFilePath = getProjectConfigFilePath(modulesConfigData);

            const projectConfigData = await loadXmlFile(projectFilePath);
            const excludedFoldersConfig = projectConfigData // TODO refactor this
                .find((c) => c.module)
                .module.find((c) => c.component)
                .component.find((c) => c.content)
                .content;

            const missingExcludedFolders = excludeFoldersPaths
                .filter((excludeFoldersPath) => !excludedFoldersConfig.some((config) => config[':@']['@_url'] === excludeFoldersPath));

            if (missingExcludedFolders.length > 0) {
                missingExcludedFolders.forEach((missingExcludedFolder) => {
                    excludedFoldersConfig.unshift({
                        excludeFolder: [],
                        ':@': {
                            '@_url': missingExcludedFolder
                        }
                    });
                });

                await buildXmlFile(projectFilePath, projectConfigData);
            }
        }
    }
});

module.exports = setupExcludedFoldersConfig;
