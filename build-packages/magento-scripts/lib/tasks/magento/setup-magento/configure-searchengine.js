const semver = require('semver')
const path = require('path')
const {
    updateTableValues,
    isTableExists,
    insertTableValues
} = require('../../../util/database')
const getJsonfileData = require('../../../util/get-jsonfile-data')
const runComposerCommand = require('../../../util/run-composer')

const magentoModuleElasticSearch8 = 'magento/module-elasticsearch-8'

const searchEngineConfigurationInCoreConfigDataKeys = (
    searchEngineEdition = 'elasticsearch7'
) => ({
    catalogSearchEngine: 'catalog/search/engine',
    catalogSearchSearchEngineServerHostname: `catalog/search/${searchEngineEdition}_server_hostname`,
    catalogSearchSearchEngineServerPort: `catalog/search/${searchEngineEdition}_server_port`,
    catalogSearchSearchEngineIndexPrefix: `catalog/search/${searchEngineEdition}_index_prefix`,
    catalogSearchSearchEngineEnableAuth: `catalog/search/${searchEngineEdition}_enable_auth`,
    catalogSearchSearchEngineServerTimeout: `catalog/search/${searchEngineEdition}_server_timeout`
})

/**
 * @param {string} openSearchVersion
 * @returns {number}
 */
const mapOpenSearchVersionToElasticSearchVersion = (openSearchVersion) => {
    const { major: parsedOSMajorVersion } = semver.parse(openSearchVersion) || {
        major: 1
    }

    if (parsedOSMajorVersion === 2) {
        return 8
    }

    return 7
}

/**
 * @param {import('../../../../typings/context').ListrContext} ctx
 */
const isNeedToInstallElasticSearch8Module = async (ctx) => {
    /**
     * @type {{ packages: { name: string, version: string }[] } | null}
     */
    const composerLockData = await getJsonfileData(
        path.join(ctx.config.baseConfig.magentoDir, 'composer.lock')
    )

    if (!composerLockData) {
        return true
    }

    return !composerLockData.packages.some(
        ({ name }) => name === magentoModuleElasticSearch8
    )
}

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const configureElasticSearchInDatabase = () => ({
    title: 'Configuring Elasticsearch',
    skip: async (ctx) => {
        const { ports, isDockerDesktop } = ctx
        const hostMachine = !isDockerDesktop
            ? '127.0.0.1'
            : 'host.docker.internal'

        const { major: parsedESMajorVersion } = semver.parse(
            ctx.elasticSearchVersion
        ) || { major: 7 }

        const coreConfigDataSearchEngineKeys =
            searchEngineConfigurationInCoreConfigDataKeys(
                `elasticsearch${parsedESMajorVersion}`
            )

        const isCoreConfigDataExists = await isTableExists(
            'magento',
            'core_config_data',
            ctx
        )

        if (isCoreConfigDataExists) {
            const elasticsearchConfig = await ctx.databaseConnection.query(
                `SELECT path,value
                FROM core_config_data
                WHERE path='${coreConfigDataSearchEngineKeys.catalogSearchEngine}'
                OR path='${coreConfigDataSearchEngineKeys.catalogSearchSearchEngineServerHostname}'
                OR path='${coreConfigDataSearchEngineKeys.catalogSearchSearchEngineServerPort}';`
            )

            const mappedElasticSearchConfig = elasticsearchConfig.reduce(
                (acc, { path, value }) => ({ ...acc, [path]: value }),
                {}
            )

            return ![
                mappedElasticSearchConfig[
                    coreConfigDataSearchEngineKeys.catalogSearchEngine
                ] === `elasticsearch${parsedESMajorVersion}`,
                mappedElasticSearchConfig[
                    coreConfigDataSearchEngineKeys
                        .catalogSearchSearchEngineServerHostname
                ] === hostMachine,
                mappedElasticSearchConfig[
                    coreConfigDataSearchEngineKeys
                        .catalogSearchSearchEngineServerPort
                ] === `${ports.elasticsearch}`
            ].includes(false)
        }

        return true
    },
    task: async (ctx, task) => {
        const { ports, databaseConnection, isDockerDesktop } = ctx
        const hostMachine = !isDockerDesktop
            ? '127.0.0.1'
            : 'host.docker.internal'

        const { major: parsedESMajorVersion } = semver.parse(
            ctx.elasticSearchVersion
        ) || { major: 7 }

        const coreConfigDataSearchEngineKeys =
            searchEngineConfigurationInCoreConfigDataKeys(
                `elasticsearch${parsedESMajorVersion}`
            )

        const elasticsearchConfig = {
            [coreConfigDataSearchEngineKeys.catalogSearchEngine]: `elasticsearch${parsedESMajorVersion}`,
            [coreConfigDataSearchEngineKeys.catalogSearchSearchEngineServerHostname]:
                hostMachine,
            [coreConfigDataSearchEngineKeys.catalogSearchSearchEngineServerPort]: `${ports.elasticsearch}`
        }

        const elasticsearchDynamicConfig = {
            [coreConfigDataSearchEngineKeys.catalogSearchEngine]: `elasticsearch${parsedESMajorVersion}`,
            [coreConfigDataSearchEngineKeys.catalogSearchSearchEngineServerHostname]:
                hostMachine,
            [coreConfigDataSearchEngineKeys.catalogSearchSearchEngineServerPort]: `${ports.elasticsearch}`
        }

        await insertTableValues(
            'core_config_data',
            Object.entries(elasticsearchConfig).map(([path, value]) => ({
                path,
                value
            })),
            { databaseConnection }
        )

        await updateTableValues(
            'core_config_data',
            Object.entries(elasticsearchDynamicConfig).map(([path, value]) => ({
                path,
                value
            })),
            {
                databaseConnection,
                task: {
                    skip() {
                        // do nothing
                    }
                }
            }
        )

        task.title = `Using Elasticsearch ${ctx.elasticSearchVersion}`
    }
})

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const installElasticSearch8Module = () => ({
    title: 'Installing Magento ElasticSearch8 Module',
    task: async (ctx, task) => {
        await runComposerCommand(
            ctx,
            `require ${magentoModuleElasticSearch8} --update-with-all-dependencies`,
            {
                callback: !ctx.verbose
                    ? undefined
                    : (t) => {
                          task.output = t
                      }
            }
        )
    },
    options: {
        bottomBar: 10
    }
})

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const configureOpenSearchInDatabase = () => ({
    title: 'Configuring OpenSearch',
    skip: async (ctx) => {
        const { ports, isDockerDesktop, magentoVersion } = ctx
        const hostMachine = !isDockerDesktop
            ? '127.0.0.1'
            : 'host.docker.internal'

        const pureMagentoVersion = magentoVersion.match(
            /^([0-9]+\.[0-9]+\.[0-9]+)/
        )[1]

        // required to determine if OpenSearch can be used
        // OpenSearch is supported in setup:install starting from Magento 2.4.6
        // OpenSearch 1 based Magento should use ES 7 compatible setup
        const isAtLeastMagento246 = semver.satisfies(
            pureMagentoVersion,
            '>=2.4.6'
        )

        const useElasticSearch6Configuration = semver.satisfies(
            pureMagentoVersion,
            '<=2.3.4'
        )

        let searchEngineMode = 'opensearch'

        if (!isAtLeastMagento246) {
            if (useElasticSearch6Configuration) {
                searchEngineMode = 'elasticsearch6'
            } else {
                searchEngineMode = `elasticsearch${mapOpenSearchVersionToElasticSearchVersion(
                    ctx.openSearchVersion
                )}`
            }
        }

        const coreConfigDataSearchEngineKeys =
            searchEngineConfigurationInCoreConfigDataKeys(searchEngineMode)

        const isCoreConfigDataExists = await isTableExists(
            'magento',
            'core_config_data',
            ctx
        )

        if (isCoreConfigDataExists) {
            const openSearchConfig = await ctx.databaseConnection.query(
                `SELECT path,value
                FROM core_config_data
                WHERE path='${coreConfigDataSearchEngineKeys.catalogSearchEngine}'
                OR path='${coreConfigDataSearchEngineKeys.catalogSearchSearchEngineServerHostname}'
                OR path='${coreConfigDataSearchEngineKeys.catalogSearchSearchEngineServerPort}';`
            )

            const mappedOpenSearchConfig = openSearchConfig.reduce(
                (acc, { path, value }) => ({ ...acc, [path]: value }),
                {}
            )

            return ![
                mappedOpenSearchConfig[
                    coreConfigDataSearchEngineKeys.catalogSearchEngine
                ] === searchEngineMode,
                mappedOpenSearchConfig[
                    coreConfigDataSearchEngineKeys
                        .catalogSearchSearchEngineServerHostname
                ] === hostMachine,
                mappedOpenSearchConfig[
                    coreConfigDataSearchEngineKeys
                        .catalogSearchSearchEngineServerPort
                ] === `${ports.elasticsearch}`
            ].includes(false)
        }

        return true
    },
    task: async (ctx, task) => {
        const { ports, databaseConnection, isDockerDesktop, magentoVersion } =
            ctx
        const hostMachine = !isDockerDesktop
            ? '127.0.0.1'
            : 'host.docker.internal'

        const pureMagentoVersion = magentoVersion.match(
            /^([0-9]+\.[0-9]+\.[0-9]+)/
        )[1]

        // required to determine if OpenSearch can be used
        // OpenSearch is supported in setup:install starting from Magento 2.4.6
        // OpenSearch 1 based Magento should use ES 7 compatible setup
        const isAtLeastMagento246 = semver.satisfies(
            pureMagentoVersion,
            '>=2.4.6'
        )

        const compatibleElasticSearchVersion =
            mapOpenSearchVersionToElasticSearchVersion(ctx.openSearchVersion)

        const useElasticSearch6Configuration = semver.satisfies(
            pureMagentoVersion,
            '<=2.3.4'
        )

        let searchEngineMode = 'opensearch'

        if (!isAtLeastMagento246) {
            if (useElasticSearch6Configuration) {
                searchEngineMode = 'elasticsearch6'
            } else {
                searchEngineMode = `elasticsearch${compatibleElasticSearchVersion}`
            }
        }

        if (searchEngineMode !== 'opensearch') {
            task.title = `Configuring OpenSearch (using Elasticsearch ${compatibleElasticSearchVersion} compatible configuration)`
        }

        const coreConfigDataSearchEngineKeys =
            searchEngineConfigurationInCoreConfigDataKeys(searchEngineMode)

        const opensearchConfig = {
            [coreConfigDataSearchEngineKeys.catalogSearchSearchEngineIndexPrefix]:
                'magento2',
            [coreConfigDataSearchEngineKeys.catalogSearchSearchEngineEnableAuth]: 0,
            [coreConfigDataSearchEngineKeys.catalogSearchSearchEngineServerTimeout]: 15
        }

        const openSearchDynamicConfig = {
            [coreConfigDataSearchEngineKeys.catalogSearchEngine]:
                searchEngineMode,
            [coreConfigDataSearchEngineKeys.catalogSearchSearchEngineServerHostname]:
                hostMachine,
            [coreConfigDataSearchEngineKeys.catalogSearchSearchEngineServerPort]: `${ports.elasticsearch}`
        }

        await insertTableValues(
            'core_config_data',
            Object.entries(opensearchConfig).map(([path, value]) => ({
                path,
                value
            })),
            { databaseConnection }
        )

        await updateTableValues(
            'core_config_data',
            Object.entries(openSearchDynamicConfig).map(([path, value]) => ({
                path,
                value
            })),
            {
                databaseConnection,
                task: {
                    skip() {
                        // do nothing
                    }
                }
            }
        )

        task.title = `Using OpenSearch ${ctx.openSearchVersion}`
    }
})

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const configureSearchEngine = () => ({
    task: async (ctx, task) => {
        const { searchengine = 'elasticsearch' } =
            ctx.config.overridenConfiguration.configuration
        const pureMagentoVersion = ctx.magentoVersion.match(
            /^([0-9]+\.[0-9]+\.[0-9]+)/
        )[1]

        if (searchengine === 'opensearch') {
            return task.newListr(configureOpenSearchInDatabase())
        }

        const isMagento246 = semver.eq(pureMagentoVersion, '2.4.6')

        const getParsedESMajorVersion = () => {
            const { major: parsedESMajorVersion } = semver.parse(
                ctx.elasticSearchVersion
            ) || { major: 7 }

            return parsedESMajorVersion
        }

        if (
            isMagento246 &&
            getParsedESMajorVersion() === 8 &&
            (await isNeedToInstallElasticSearch8Module(ctx))
        ) {
            return task.newListr([
                installElasticSearch8Module(),
                configureElasticSearchInDatabase()
            ])
        }

        return task.newListr(configureElasticSearchInDatabase())
    }
})

module.exports = configureSearchEngine
