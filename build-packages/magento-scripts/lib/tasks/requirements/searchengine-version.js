const checkElasticSearchVersion = require('./elasticsearch-version')
const checkOpenSearchVersion = require('./opensearch-version')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const checkSearchEngineVersion = () => ({
    task: async (ctx, task) => {
        const { searchengine = 'elasticsearch' } =
            ctx.config.overridenConfiguration.configuration
        if (searchengine === 'opensearch') {
            return task.newListr(checkOpenSearchVersion())
        }

        return task.newListr(checkElasticSearchVersion())
    },
    exitOnError: false
})

module.exports = checkSearchEngineVersion
