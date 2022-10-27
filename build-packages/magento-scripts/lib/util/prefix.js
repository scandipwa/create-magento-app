const path = require('path')
const fs = require('fs')
const { projectsConfig, projectKey } = require('../config/config')

const { name: legacyFolderName, base: folderName } = path.parse(process.cwd())

const getPrefix = (fName = folderName) => {
    const projectInGlobalConfig = projectsConfig.get(projectKey)

    if (!projectInGlobalConfig || !projectInGlobalConfig.createdAt) {
        const projectStat = fs.statSync(process.cwd())
        const projectCreatedAt = Math.floor(
            projectStat.birthtime.getTime() / 1000
        ).toString()
        process.isFirstStart = 1

        // if createdAt property does not set in config, means that project is threaded as legacy
        // so it uses docker volumes and containers names without prefixes, so it doesn't have creation date
        // as it's unknown
        projectsConfig.set(projectKey, {
            prefix: '',
            createdAt: projectCreatedAt
        })
    }

    if (projectInGlobalConfig && projectInGlobalConfig.prefix) {
        return `${fName}-${projectInGlobalConfig.prefix}`
    }

    return fName
}

const getProjectCreatedAt = () => {
    const projectInGlobalConfig = projectsConfig.get(projectKey)

    if (projectInGlobalConfig && projectInGlobalConfig.createdAt) {
        return new Date(parseInt(projectInGlobalConfig.createdAt, 10) * 1000)
    }

    return null
}

/**
 * @param {boolean} usePrefix
 */
const setPrefix = (usePrefix) => {
    const projectInGlobalConfig = projectsConfig.get(projectKey)
    if (projectInGlobalConfig) {
        if (usePrefix && !projectInGlobalConfig.prefix) {
            const createdAt =
                projectInGlobalConfig.createdAt ||
                Math.floor(
                    fs.statSync(process.cwd()).birthtime.getTime() / 1000
                ).toString()
            projectsConfig.set(`${projectKey}.prefix`, createdAt)
        }
        if (!usePrefix && projectInGlobalConfig.prefix) {
            projectsConfig.set(`${projectKey}.prefix`, '')
        }
    }
}

module.exports = {
    setPrefix,
    getPrefix,
    getProjectCreatedAt,
    legacyFolderName,
    folderName
}
