const checkElasticSearchVersion = require('./elasticsearch-version')
const checkOpenSearchVersion = require('./opensearch-version')

const checkSearchEngineVersion = () => ({
    title: "Checking search engine in use",
    task: async (ctx, task) => {
        const { searchengine } =
        ctx.config.overridenConfiguration.configuration
        if (searchengine.engine === 'elasticsearch') {
            return task.newListr(
                checkElasticSearchVersion()
            )
        }
        if (searchengine.engine === 'opensearch') {
            return task.newListr(
                checkOpenSearchVersion()
            )
        }
    },
    exitOnError: false
})

module.exports = checkSearchEngineVersion
