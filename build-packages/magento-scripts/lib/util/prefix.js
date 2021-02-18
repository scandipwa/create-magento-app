const path = require('path');
const Conf = require('conf');

const pkg = require('../../package.json');

const config = new Conf({
    configName: 'projects',
    projectName: 'create-magento-app',
    projectVersion: pkg.version,
    defaults: {}
});

const { name: folderName } = path.parse(process.cwd());
const key = `${process.cwd()}`;

const getPrefix = () => {
    const projectInGlobalConfig = config.get(key);

    if (!projectInGlobalConfig || !projectInGlobalConfig.createdAt) {
        const createdAt = Math.floor(Date.now() / 1000).toString();
        // if createdAt property does not set in config, means that project is threaded as legacy
        // so it uses docker volumes and containers names without prefixes, so it doesn't have creation date
        // as it's unknown
        config.set(key, {
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
    const projectInGlobalConfig = config.get(key);

    if (projectInGlobalConfig && projectInGlobalConfig.createdAt) {
        return new Date(parseInt(projectInGlobalConfig.createdAt, 10) * 1000);
    }

    return null;
};

const setPrefix = (usePrefix) => {
    const projectInGlobalConfig = config.get(key);
    if (projectInGlobalConfig) {
        if (usePrefix && !projectInGlobalConfig.prefix) {
            const createdAt = projectInGlobalConfig.createdAt || Math.floor(Date.now() / 1000).toString();
            config.set(`${key}.prefix`, createdAt);
        }
        if (!usePrefix && projectInGlobalConfig.prefix) {
            config.set(`${key}.prefix`, '');
        }
    }
};

module.exports = {
    prefixConfig: config,
    setPrefix,
    getPrefix,
    getProjectCreatedAt
};
