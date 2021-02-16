const Conf = require('conf');

const config = new Conf({
    configName: 'create-magento-app',
    projectName: 'create-magento-app',
    defaults: {
        projects: {}
    }
});

const setPrefix = (destination) => {
    const key = `projects.${destination}`;
    const configInGlobalPath = config.get(key);

    if (!configInGlobalPath) {
        config.set(key, {
            // set createdAt with unix timestamp
            createdAt: Math.floor(Date.now() / 1000).toString()
        });
    }
};

module.exports = {
    setPrefix
};
