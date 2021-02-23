const Conf = require('conf');

const pkg = require('../../package.json');

const projectsConfig = new Conf({
    configName: 'projects',
    projectName: 'create-magento-app',
    projectVersion: pkg.version,
    defaults: {}
});
const projectKey = process.cwd();

module.exports = {
    projectsConfig,
    projectKey
};
