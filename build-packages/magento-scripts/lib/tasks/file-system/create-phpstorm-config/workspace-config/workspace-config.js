const path = require('path')
const { baseConfig } = require('../../../../config')

/**
 * @param {import('../../../../../typings/index').CMAConfiguration} app
 */
const getWorkspaceConfig = (app) => ({
    debugServerAddress: `http://${app.storeDomains.admin}`,
    serverName: 'create-magento-app',
    runManagerName: 'create-magento-app',
    sessionId: 'PHPSTORM',
    path: path.join(process.cwd(), '.idea', 'workspace.xml'),
    templatePath: path.join(baseConfig.templateDir, 'workspace.template.xml')
})

module.exports = {
    getWorkspaceConfig
}
