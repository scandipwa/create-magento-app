const path = require('path');

const getPhpStormConfig = (app, config) => {
    const [majorPHPVersion, minorPHPVersion] = app.configuration.php.version.split('.');
    const phpLanguageLevel = `${ majorPHPVersion }.${ minorPHPVersion }`;
    const { templateDir } = config;
    const phpStormConfiguration = {
        xdebug: {
            v2Port: '9111',
            v3Port: '9003',
            debugServerAddress: `http://${ app.host }`,
            serverName: 'create-magento-app',
            runManagerName: 'create-magento-app',
            sessionId: 'PHPSTORM',
            path: path.join(process.cwd(), '.idea', 'workspace.xml'),
            templatePath: path.join(templateDir, 'workspace.template.xml')
        },
        php: {
            phpLanguageLevel,
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
        },
        inspectionTools: {
            path: path.join(process.cwd(), '.idea', 'inspectionProfiles', 'Project_Default.xml'),
            templatePath: path.join(templateDir, 'Project_Default.template.xml')
        }
    };

    return phpStormConfiguration;
};

module.exports = {
    getPhpStormConfig
};
