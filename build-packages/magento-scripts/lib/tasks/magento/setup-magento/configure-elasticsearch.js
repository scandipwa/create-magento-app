const { updateTableValues, isTableExists } = require('../../../util/database')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
module.exports = () => ({
    title: 'Configuring Elasticsearch',
    skip: async (ctx) =>
        !(await isTableExists('magento', 'core_config_data', ctx)),
    task: async (ctx, task) => {
        const { ports, databaseConnection, isDockerDesktop } = ctx
        const hostMachine = !isDockerDesktop
            ? '127.0.0.1'
            : 'host.docker.internal'
        await updateTableValues(
            'core_config_data',
            [
                { path: 'catalog/search/engine', value: 'elasticsearch7' },
                {
                    path: 'catalog/search/elasticsearch7_server_hostname',
                    value: hostMachine
                },
                {
                    path: 'catalog/search/elasticsearch7_server_port',
                    value: `${ports.elasticsearch}`
                }
            ],
            { databaseConnection, task }
        )
    }
})
