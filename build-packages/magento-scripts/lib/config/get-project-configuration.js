const { getConfigFromMagentoVersion } = require('./index')

/**
 * @returns {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const getProjectConfiguration = () => ({
    title: 'Getting project configuration',
    task: async (ctx) => {
        const { magentoVersion } = ctx

        ctx.config = await getConfigFromMagentoVersion(ctx, {
            magentoVersion
        })
    }
})

module.exports = getProjectConfiguration
