const Conf = require('conf')

const pkg = require('../../package.json')
/**
 * @type {import('conf/dist/source').default}
 */
const cmaGlobalConfig = new Conf({
    configName: 'config',
    projectName: 'create-magento-app',
    projectVersion: pkg.version,
    defaults: {}
})

module.exports = {
    cmaGlobalConfig
}
