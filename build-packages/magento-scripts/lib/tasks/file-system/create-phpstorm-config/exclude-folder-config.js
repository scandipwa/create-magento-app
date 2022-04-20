const path = require('path');
const { loadXmlFile, buildXmlFile } = require('../../../config/xml-parser');
const pathExists = require('../../../util/path-exists');

const pathToModulesConfig = path.join(process.cwd(), '.idea', 'modules.xml');
const excludeFoldersPaths = [
    'bin',
    'dev',
    'pub',
    'setup',
    'var/cache',
    'var/page_cache',
    'var/log'
].map((p) => `file://$MODULE_DIR$/${p}`);

/**
 * Will retrieve project config file path from module.xml
 *
 * @returns {Promise<String>}
 */
const getProjectConfigFilePath = async () => {
    const modulesConfigData = await loadXmlFile(pathToModulesConfig);
    return modulesConfigData.project.component.modules.module['@_filepath'].replace('$PROJECT_DIR$', process.cwd());
};

/**
 * @returns {Array<{'@_url': string}>}
 */
const getExcludedFoldersConfig = (projectConfigData) => projectConfigData
    .module.component.content.excludeFolder;

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const setupExcludedFoldersConfig = () => ({
    title: 'Set up excluded folders configuration',
    task: async (ctx, task) => {
        if (await pathExists(pathToModulesConfig)) {
            const projectFilePath = await getProjectConfigFilePath();
            const projectConfigData = await loadXmlFile(projectFilePath);
            const excludedFoldersConfig = getExcludedFoldersConfig(projectConfigData);

            // filter excluded folders to get ones that needs to be added to excluded folders list
            const missingExcludedFolders = excludeFoldersPaths
                .filter(
                    (excludeFoldersPath) => !excludedFoldersConfig.some(
                        (config) => config['@_url'] === excludeFoldersPath
                    )
                );

            if (missingExcludedFolders.length > 0) {
                missingExcludedFolders.forEach((missingExcludedFolder) => {
                    excludedFoldersConfig.unshift({
                        '@_url': missingExcludedFolder
                    });
                });

                await buildXmlFile(projectFilePath, projectConfigData);
                return;
            }

            task.skip();
        }

        // TODO generate project config with excluded folders
    }
});

module.exports = setupExcludedFoldersConfig;
