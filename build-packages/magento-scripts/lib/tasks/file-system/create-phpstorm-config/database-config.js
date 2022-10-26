/* eslint-disable no-param-reassign */
const path = require('path')
const { baseConfig } = require('../../../config')
const { loadXmlFile, buildXmlFile } = require('../../../config/xml-parser')
const UnknownError = require('../../../errors/unknown-error')
const {
    connectionStringParser,
    connectionStringBuilder
} = require('../../../util/connection-string')
const pathExists = require('../../../util/path-exists')
const setConfigFile = require('../../../util/set-config')

const databaseConfiguration = {
    driver: 'mysql',
    dataSourceManagerName: 'mysql 8.0',
    dataSourcesLocal: {
        path: path.join(process.cwd(), '.idea', 'dataSources.local.xml'),
        templatePath: path.join(
            baseConfig.templateDir,
            'dataSources.local.template.xml'
        )
    },
    dataSources: {
        path: path.join(process.cwd(), '.idea', 'dataSources.xml'),
        templatePath: path.join(
            baseConfig.templateDir,
            'dataSources.template.xml'
        )
    }
}

/**
 * Get link to data-source field, create fields if necessary
 *
 * @param {*} data
 * @param {*} defaultData Default data structure that will be used if original data is missing
 */
const getToDataSource = (data, defaultData) => {
    if (!data.project) {
        data.project = defaultData.project
    }

    if (!data.project.component) {
        data.project.component = defaultData.project.component
    }

    if (!data.project.component['data-source']) {
        data.project.component['data-source'] =
            defaultData.project.component['data-source']
    }

    return data.project.component['data-source']
}
// const mariadbVersion = await ctx.databaseConnection.query('SHOW VARIABLES LIKE "%version%";');
/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const setupDataSourceLocalConfig = () => ({
    title: 'Set up datasource local configuration',
    task: async (ctx, task) => {
        if (await pathExists(databaseConfiguration.dataSourcesLocal.path)) {
            let hasChanges = false
            const dataSourcesLocalData = await loadXmlFile(
                databaseConfiguration.dataSourcesLocal.path
            )
            const dataSource = getToDataSource(dataSourcesLocalData, {
                project: {
                    '@_version': '4',
                    component: {
                        '@_name': 'dataSourceStorageLocal',
                        '@_created-in': 'PS-212.5284.49',
                        'data-source': {
                            '@_uuid': 'a2eadb3c-6fc9-4d85-b5f4-d8114906ce2f'
                        }
                    }
                }
            })

            if (!dataSource['@_name']) {
                hasChanges = true
                dataSource['@_name'] =
                    databaseConfiguration.dataSourceManagerName
            }

            if (!dataSource['@_uuid']) {
                hasChanges = true
                dataSource['@_uuid'] = 'a2eadb3c-6fc9-4d85-b5f4-d8114906ce2f'
            }

            const defaultDatabaseInfoConfig = {
                '@_product': '',
                '@_version': '',
                '@_jdbc-version': '',
                '@_driver-name': '',
                '@_driver-version': '',
                '@_dbms': 'MYSQL',
                '@_exact-version': '0'
            }
            const isDatabaseInfoChangeNeeded = dataSource['database-info']
                ? Object.entries(defaultDatabaseInfoConfig).some(
                      ([key]) => !(key in dataSource['database-info'])
                  )
                : true

            if (isDatabaseInfoChangeNeeded) {
                hasChanges = true
                if (!dataSource['database-info']) {
                    dataSource['database-info'] = defaultDatabaseInfoConfig
                } else {
                    Object.entries(defaultDatabaseInfoConfig).forEach(
                        ([key, value]) => {
                            if (!(key in dataSource['database-info'])) {
                                dataSource['database-info'][key] = value
                            }
                            // ^^^ only set missing properties, only ones should be in place
                        }
                    )
                }
            }

            const dataSourceDefaultData = {
                'secret-storage': 'master_key',
                'user-name': 'magento'
            }

            const isDataSourceDataChangeNeeded = dataSource
                ? Object.entries(dataSourceDefaultData).some(
                      ([key, value]) => dataSource[key] !== value
                  )
                : true

            if (isDataSourceDataChangeNeeded) {
                hasChanges = true
                Object.entries(dataSourceDefaultData).forEach(
                    ([key, value]) => {
                        dataSource[key] = value
                    }
                )
            }

            if (dataSource && dataSource['schema-mapping'] === undefined) {
                hasChanges = true
                dataSource['schema-mapping'] = ''
            }

            if (hasChanges) {
                await buildXmlFile(
                    databaseConfiguration.dataSourcesLocal.path,
                    dataSourcesLocalData
                )
            } else {
                task.skip()
            }
        } else {
            try {
                await setConfigFile({
                    configPathname: databaseConfiguration.dataSourcesLocal.path,
                    template:
                        databaseConfiguration.dataSourcesLocal.templatePath,
                    overwrite: true,
                    templateArgs: {
                        databaseConfiguration
                    }
                })
            } catch (e) {
                throw new UnknownError(
                    `Unexpected error accrued during dataSources.local.xml config creation\n\n${e}`
                )
            }
        }
    }
})

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const setupDataSourceConfig = () => ({
    task: async (ctx, task) => {
        if (await pathExists(databaseConfiguration.dataSources.path)) {
            let hasChanges = false
            const dataSourcesData = await loadXmlFile(
                databaseConfiguration.dataSources.path
            )
            const dataSource = getToDataSource(dataSourcesData, {
                project: {
                    '@_version': '4',
                    component: {
                        '@_name': 'DataSourceManagerImpl',
                        '@_format': 'xml',
                        '@_multifile-model': true,
                        'data-source': {
                            '@_source': 'LOCAL',
                            '@_uuid': 'a2eadb3c-6fc9-4d85-b5f4-d8114906ce2f'
                        }
                    }
                }
            })

            if (dataSource['jdbc-url']) {
                const parsedJDBC = dataSource['jdbc-url'].match(/jdbc:(\S+)/i)
                if (parsedJDBC && parsedJDBC.length > 0) {
                    const url = parsedJDBC[1]
                    const parsedJDBCUrl = connectionStringParser(url)

                    if (/\S+:undefined/.test(parsedJDBCUrl.host)) {
                        hasChanges = true
                        parsedJDBCUrl.host = parsedJDBCUrl.host
                            .split(':')
                            .shift()
                    }

                    if (parsedJDBCUrl.port !== `${ctx.ports.mariadb}`) {
                        hasChanges = true
                        parsedJDBCUrl.port = `${ctx.ports.mariadb}`

                        dataSource[
                            'jdbc-url'
                        ] = `jdbc:${connectionStringBuilder(parsedJDBCUrl)}`
                    }
                }
            }

            if (dataSource['@_uuid'] === undefined) {
                hasChanges = true
                dataSource['@_uuid'] = 'a2eadb3c-6fc9-4d85-b5f4-d8114906ce2f'
            }

            const expectedDataSourceData = {
                '@_name': databaseConfiguration.dataSourceManagerName,
                'driver-ref': 'mysql.8',
                synchronize: true,
                'jdbc-driver': 'com.mysql.cj.jdbc.Driver',
                'jdbc-url': `jdbc:mysql://localhost:${ctx.ports.mariadb}/magento`,
                'working-dir': '$ProjectFileDir$',
                '@_source': 'LOCAL'
            }

            const isDataSourceNeedChanges = dataSource
                ? Object.entries(expectedDataSourceData).some(
                      ([key]) => !(key in dataSource)
                  )
                : true

            if (isDataSourceNeedChanges) {
                hasChanges = true
                if (!dataSource) {
                    dataSourcesData.project.component['data-source'] =
                        expectedDataSourceData
                } else {
                    Object.entries(expectedDataSourceData).forEach(
                        ([key, value]) => {
                            if (!(key in dataSource)) {
                                dataSource[key] = value
                            }
                        }
                    )
                }
            }

            if (hasChanges) {
                await buildXmlFile(
                    databaseConfiguration.dataSources.path,
                    dataSourcesData
                )
            } else {
                task.skip()
            }
        } else {
            try {
                await setConfigFile({
                    configPathname: databaseConfiguration.dataSources.path,
                    template: databaseConfiguration.dataSources.templatePath,
                    overwrite: true,
                    templateArgs: {
                        databaseConfiguration,
                        jdbcUrl: `jdbc:mysql://localhost:${ctx.ports.mariadb}/magento`
                    }
                })
            } catch (e) {
                throw new UnknownError(
                    `Unexpected error accrued during dataSources.xml config creation\n\n${e}`
                )
            }
        }
    }
})

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const setupDatabaseConfig = () => ({
    title: 'Set up database configuration',
    task: (ctx, task) =>
        task.newListr([setupDataSourceLocalConfig(), setupDataSourceConfig()])
})

module.exports = setupDatabaseConfig
