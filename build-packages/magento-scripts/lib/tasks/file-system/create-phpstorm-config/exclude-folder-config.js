const path = require('path')
const { loadXmlFile, buildXmlFile } = require('../../../config/xml-parser')
const pathExists = require('../../../util/path-exists')
const { urlKey, typeKey, versionKey, nameKey } = require('./keys')
const { formatPathForPHPStormConfig } = require('./xml-utils')

const pathToModulesConfig = path.join(process.cwd(), '.idea', 'modules.xml')
const excludeFoldersPaths = [
    'bin',
    'dev',
    'pub/static',
    'var/cache',
    'var/page_cache',
    'var/log',
    'var/composer_home',
    'var/view_preprocessed'
].map((p) => `file://$MODULE_DIR$/${p}`)

const mustBeIncludedPaths = ['pub', 'setup'].map(
    (p) => `file://$MODULE_DIR$/${p}`
)

/**
 * Will retrieve project config file path from module.xml
 *
 * @returns {Promise<String | null>}
 */
const getProjectConfigFilePath = async () => {
    const modulesConfigData = await loadXmlFile(pathToModulesConfig)
    const { project: { component: { modules: { module } = {} } = {} } = {} } =
        modulesConfigData || {}
    const filePath = module && module['@_filepath']
    return filePath ? filePath.replace('$PROJECT_DIR$', process.cwd()) : null
}

const setupDefaultsForExcludedFoldersConfig = (projectConfigData) => {
    if (!projectConfigData.module) {
        projectConfigData.module = {
            [typeKey]: 'WEB_MODULE',
            [versionKey]: '4'
        }
    }

    if (!projectConfigData.module.component) {
        projectConfigData.module.component = {
            [nameKey]: 'NewModuleRootManager',
            orderEntry: [
                {
                    [typeKey]: 'inheritedJdk'
                },
                {
                    [typeKey]: 'sourceFolder',
                    '@_forTest': 'false'
                }
            ]
        }
    }

    if (!projectConfigData.module.component.content) {
        projectConfigData.module.component.content = {
            [urlKey]: 'file://$MODULE_DIR$'
        }
    }

    if (!projectConfigData.module.component.content.excludeFolder) {
        projectConfigData.module.component.content.excludeFolder = []
    }
}

const setupExcludedFolders = (projectConfigData) => {
    const { excludeFolder } = projectConfigData.module.component.content
    let hasChanges = false
    // filter excluded folders to get ones that needs to be added to excluded folders list
    const missingExcludedFolders = excludeFoldersPaths.filter(
        (excludeFoldersPath) =>
            !excludeFolder.some(
                (config) => config[urlKey] === excludeFoldersPath
            )
    )

    if (missingExcludedFolders.length > 0) {
        hasChanges = true
        missingExcludedFolders.forEach((missingExcludedFolder) => {
            projectConfigData.module.component.content.excludeFolder.unshift({
                [urlKey]: missingExcludedFolder
            })
        })
    }

    const hasSomePathsThatMustBeFiltered = excludeFolder.some((config) =>
        mustBeIncludedPaths.includes(config[urlKey])
    )

    if (hasSomePathsThatMustBeFiltered) {
        projectConfigData.module.component.content.excludeFolder =
            excludeFolder.filter(
                (config) => !mustBeIncludedPaths.includes(config[urlKey])
            )
        hasChanges = true
    }

    return hasChanges
}

const getIMLFilePath = async () => {
    const filePath = path.join(
        process.cwd(),
        '.idea',
        `${path.parse(process.cwd()).base}.iml`
    )
    if (!(await pathExists(pathToModulesConfig))) {
        const fileFormattedPath = formatPathForPHPStormConfig(filePath)
        const fileFormattedUrl = `file://${fileFormattedPath}`

        const modulesConfig = {
            '?xml': {
                [versionKey]: '1.0',
                '@_encoding': 'UTF-8'
            },
            project: {
                [versionKey]: '4',
                component: {
                    [nameKey]: 'ProjectModuleManager',
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
        }

        await buildXmlFile(pathToModulesConfig, modulesConfig)
    }

    return filePath
}

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const setupExcludedFoldersConfig = () => ({
    title: 'Set up excluded folders configuration',
    task: async (ctx, task) => {
        if (await pathExists(pathToModulesConfig)) {
            const projectFilePath = await getProjectConfigFilePath()
            if (projectFilePath && (await pathExists(projectFilePath))) {
                const projectConfigData = await loadXmlFile(projectFilePath)
                setupDefaultsForExcludedFoldersConfig(projectConfigData)
                const hasChanges = setupExcludedFolders(projectConfigData)
                if (hasChanges) {
                    await buildXmlFile(projectFilePath, projectConfigData)
                } else {
                    task.skip()
                }

                return
            }
        }

        const projectFilePath = await getIMLFilePath()
        const projectConfigData = {
            '?xml': {
                [versionKey]: '1.0',
                '@_encoding': 'UTF-8'
            }
        }

        setupDefaultsForExcludedFoldersConfig(projectConfigData)
        setupExcludedFolders(projectConfigData)

        await buildXmlFile(projectFilePath, projectConfigData)
    }
})

module.exports = setupExcludedFoldersConfig
