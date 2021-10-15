const path = require('path');

module.exports = (app, config) => {
    const { templateDir } = config;

    const phpStormConfiguration = {
        xdebug: {
            v2Port: '9111',
            v3Port: '9003',
            debugServerAddress: `http://${ app.host}`,
            serverName: 'create-magento-app',
            runManagerName: 'create-magento-app',
            sessionId: 'PHPSTORM',
            path: path.join(process.cwd(), '.idea', 'workspace.xml'),
            templatePath: path.join(templateDir, 'workspace.template.xml')
        },
        php: {
            version: `${ app.configuration.php.version.split('.')[0] }.${ app.configuration.php.version.split('.')[1] }`,
            path: path.join(process.cwd(), '.idea', 'php.xml'),
            templatePath: path.join(templateDir, 'php.template.xml')
        },
        database: {
            driver: 'mysql',
            dataSourceManagerName: 'mysql 8.0',
            dataSourcesLocal: {
                path: path.join(process.cwd(), '.idea', 'dataSources.local.xml'),
                templatePath: path.join(templateDir, 'dataSources.local.template.xml')
            },
            dataSources: {
                path: path.join(process.cwd(), '.idea', 'dataSources.xml'),
                templatePath: path.join(templateDir, 'dataSources.template.xml')
            }
        }
    };

    return phpStormConfiguration;
};
