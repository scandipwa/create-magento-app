const path = require('path');
const { projectsConfig, projectKey } = require('../config/config');

const { name: folderName } = path.parse(process.cwd());

const getPrefix = () => {
    const projectInGlobalConfig = projectsConfig.get(projectKey);

    if (!projectInGlobalConfig || !projectInGlobalConfig.createdAt) {
        const createdAt = Math.floor(Date.now() / 1000).toString();
        process.env.isLegacy = 1;

        // if createdAt property does not set in config, means that project is threaded as legacy
        // so it uses docker volumes and containers names without prefixes, so it doesn't have creation date
        // as it's unknown
        projectsConfig.set(projectKey, {
            prefix: '',
            createdAt
        });
    }

    if (projectInGlobalConfig && projectInGlobalConfig.prefix) {
        return `${folderName}-${projectInGlobalConfig.prefix}`;
    }

    return folderName;
};

const getProjectCreatedAt = () => {
    const projectInGlobalConfig = projectsConfig.get(projectKey);
    if (projectInGlobalConfig && projectInGlobalConfig.createdAt) {
        return new Date(parseInt(projectInGlobalConfig.createdAt, 10) * 1000);
    }

    return null;
};

const setPrefix = (usePrefix) => {
    const projectInGlobalConfig = projectsConfig.get(projectKey);
    if (projectInGlobalConfig) {
        if (usePrefix && !projectInGlobalConfig.prefix) {
            const createdAt = projectInGlobalConfig.createdAt || Math.floor(Date.now() / 1000).toString();
            projectsConfig.set(`${projectKey}.prefix`, createdAt);
        }
        if (!usePrefix && projectInGlobalConfig.prefix) {
            projectsConfig.set(`${projectKey}.prefix`, '');
        }
    }
};

module.exports = {
    setPrefix,
    getPrefix,
    getProjectCreatedAt
};
