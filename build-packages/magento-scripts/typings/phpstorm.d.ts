export interface PHPStormConfig {
    xdebug: {
        v2Port: string
        v3Port: string
        debugServerAddress: string
        serverName: string
        runManagerName: string
        sessionId: string
        path: string
        templatePath: string
    }
    php: {
        phpLanguageLevel: string
        path: string
        templatePath: string
    }
    database: {
        driver: string
        dataSourceManagerName: string
        dataSourcesLocal: {
            path: string
            templatePath: string
        }
        dataSources: {
            path: string
            templatePath: string
        }
    }
    inspectionTools: {
        path: string
        templatePath: string
    }
}
