const path = require('path');
const Conf = require('conf');

const pkg = require('../../package.json');

const config = new Conf({
    configName: 'create-magento-app',
    projectName: 'create-magento-app',
    projectVersion: pkg.version,
    defaults: {
        projects: {}
    }
});

const { name: folderName } = path.parse(process.cwd());
const key = `projects.${process.cwd()}`;

const getPrefix = () => {
    const projectInGlobalConfig = config.get(key);

    if (!projectInGlobalConfig) {
        // if createdAt property does not set in config, means that project is threaded as legacy
        // so it uses docker volumes and containers names without prefixes, so it doesn't have creation date
        // as it's unknown
        config.set(key, {
            createdAt: ''
        });
    }

    if (projectInGlobalConfig && projectInGlobalConfig.createdAt) {
        return `${folderName}-${projectInGlobalConfig.createdAt}`;
    }

    return folderName;
};

const getProjectCreatedAt = () => {
    const projectInGlobalConfig = config.get(key);

    if (projectInGlobalConfig && projectInGlobalConfig.createdAt) {
        return new Date(parseInt(projectInGlobalConfig.createdAt, 10) * 1000);
    }

    return null;
};

module.exports = {
    getPrefix,
    getProjectCreatedAt
};
