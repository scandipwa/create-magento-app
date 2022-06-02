const path = require('path');
const { loadXmlFile, buildXmlFile } = require('../../../config/xml-parser');
const pathExists = require('../../../util/path-exists');
const { formatPathForPHPStormConfig } = require('./xml-utils');

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
const getExcludedFoldersConfig = (projectConfigData) => {
    if (!projectConfigData.module) {
        projectConfigData.module = {
            '@_type': 'WEB_MODULE',
            '@_version': '4'
        };
    }

    if (!projectConfigData.module.component) {
        projectConfigData.module.component = {
            '@_name': 'NewModuleRootManager',
            orderEntry: [
                {
                    '@_type': 'inheritedJdk'
                },
                {
                    '@_type': 'sourceFolder',
                    '@_forTest': 'false'
                }
            ]
        };
    }

    if (!projectConfigData.module.component.content) {
        projectConfigData.module.component.content = {
            '@_url': 'file://$MODULE_DIR$'
        };
    }

    if (!projectConfigData.module.component.content.excludeFolder) {
        projectConfigData.module.component.content.excludeFolder = [];
    }

    return projectConfigData
        .module.component.content.excludeFolder;
};

const setupExcludedFolders = (excludedFoldersConfig) => {
    let hasChanges = false;
    // filter excluded folders to get ones that needs to be added to excluded folders list
    const missingExcludedFolders = excludeFoldersPaths
        .filter(
            (excludeFoldersPath) => !excludedFoldersConfig.some(
                (config) => config['@_url'] === excludeFoldersPath
            )
        );

    if (missingExcludedFolders.length > 0) {
        hasChanges = true;
        missingExcludedFolders.forEach((missingExcludedFolder) => {
            excludedFoldersConfig.unshift({
                '@_url': missingExcludedFolder
            });
        });
    }

    return hasChanges;
};

const createModulesXML = async () => {
    const filePath = path.join(process.cwd(), '.idea', `${path.parse(process.cwd()).base}.iml`);
    const fileFormattedPath = formatPathForPHPStormConfig(filePath);
    const fileFormattedUrl = `file://${fileFormattedPath}`;

    const modulesConfig = {
        '?xml': {
            '@_version': '1.0',
            '@_encoding': 'UTF-8'
        },
        project: {
            '@_version': '4',
            component: {
                '@_name': 'ProjectModuleManager',
                modules: [
                    {
                        module: {
                            '@_fileurl': fileFormattedUrl,
                            '@_filepath': fileFormattedPath
                        }
                    }
                ]
            }
        }
    };

    await buildXmlFile(pathToModulesConfig, modulesConfig);

    return filePath;
};

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
            const hasChanges = setupExcludedFolders(excludedFoldersConfig);
            if (hasChanges) {
                await buildXmlFile(projectFilePath, projectConfigData);
            } else {
                task.skip();
            }

            return;
        }

        const projectFilePath = await createModulesXML();
        const projectConfigData = {
            '?xml': {
                '@_version': '1.0',
                '@_encoding': 'UTF-8'
            }
        };
        const excludedFoldersConfig = getExcludedFoldersConfig(projectConfigData);
        setupExcludedFolders(excludedFoldersConfig);

        await buildXmlFile(projectFilePath, projectConfigData);
    }
});

module.exports = setupExcludedFoldersConfig;
