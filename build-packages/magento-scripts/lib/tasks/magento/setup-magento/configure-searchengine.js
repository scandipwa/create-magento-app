const semver = require('semver')
const path = require('path')
const { updateTableValues, isTableExists } = require('../../../util/database')
const getJsonfileData = require('../../../util/get-jsonfile-data')
const runComposerCommand = require('../../../util/run-composer')

const magentoModuleElasticSearch8 = 'magento/module-elasticsearch-8'

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
        const isCoreConfigDataExists = await isTableExists(
            'magento',
            'core_config_data',
            ctx
        )
        if (isCoreConfigDataExists) {
            const elasticsearchConfig = await ctx.databaseConnection.query(
                `SELECT path,value FROM core_config_data WHERE path='catalog/search/engine';`
            )

            if (elasticsearchConfig.length > 0) {
                const { major: parsedESMajorVersion } = semver.parse(
                    ctx.elasticSearchVersion
                ) || { major: 7 }
                const elasticsearchSearchEngine = `elasticsearch${parsedESMajorVersion}`

                return (
                    elasticsearchConfig[0].value === elasticsearchSearchEngine
                )
            }
        }

        return false
    },
    task: async (ctx, task) => {
        const { ports, databaseConnection, isDockerDesktop } = ctx
        const hostMachine = !isDockerDesktop
            ? '127.0.0.1'
            : 'host.docker.internal'

        const { major: parsedESMajorVersion } = semver.parse(
            ctx.elasticSearchVersion
        ) || { major: 7 }

        const elasticsearchConfig = {
            'catalog/search/engine': `elasticsearch${parsedESMajorVersion}`,
            [`catalog/search/elasticsearch${parsedESMajorVersion}_server_hostname`]:
                hostMachine,
            [`catalog/search/elasticsearch${parsedESMajorVersion}_server_port`]: `${ports.elasticsearch}`
        }

        await updateTableValues(
            'core_config_data',
            Object.entries(elasticsearchConfig).map(([path, value]) => ({
                path,
                value
            })),
            { databaseConnection, task }
        )
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
        const isCoreConfigDataExists = await isTableExists(
            'magento',
            'core_config_data',
            ctx
        )
        if (isCoreConfigDataExists) {
            const openSearchConfig = await ctx.databaseConnection.query(
                `SELECT path,value FROM core_config_data WHERE path='catalog/search/engine';`
            )

            if (openSearchConfig.length > 0) {
                return openSearchConfig[0].value === 'opensearch'
            }
        }

        return false
    },
    task: async (ctx, task) => {
        const { ports, databaseConnection, isDockerDesktop } = ctx
        const hostMachine = !isDockerDesktop
            ? '127.0.0.1'
            : 'host.docker.internal'

        const opensearchConfig = {
            'catalog/search/engine': 'opensearch',
            'catalog/search/opensearch_server_hostname': hostMachine,
            'catalog/search/opensearch_server_port': `${ports.elasticsearch}`,
            'catalog/search/opensearch_index_prefix': 'magento2',
            'catalog/search/opensearch_enable_auth': 0,
            'catalog/search/opensearch_server_timeout': 15
        }

        await updateTableValues(
            'core_config_data',
            Object.entries(opensearchConfig).map(([path, value]) => ({
                path,
                value
            })),
            { databaseConnection, task }
        )
    }
})

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const configureSearchEngine = () => ({
    task: async (ctx, task) => {
        const { searchengine = 'elasticsearch' } =
            ctx.config.overridenConfiguration.configuration

        if (searchengine === 'opensearch') {
            return task.newListr(configureOpenSearchInDatabase())
        }

        const { major: parsedESMajorVersion } = semver.parse(
            ctx.elasticSearchVersion
        ) || { major: 7 }

        if (
            parsedESMajorVersion === 8 &&
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
