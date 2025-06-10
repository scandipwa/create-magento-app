const envPhpToJson = require('../../../util/env-php-json')
const magentoTask = require('../../../util/magento-task')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const enableFullPageCacheWithVarnish = () => ({
    skip: (ctx) => {
        const { varnish } = ctx.config.overridenConfiguration.configuration

        return !varnish.enabled
    },
    task: async (ctx, task) => {
        const envData = await envPhpToJson(ctx)
        if (
            envData &&
            envData.cache_types &&
            typeof envData.cache_types.full_page === 'number' &&
            envData.cache_types.full_page !== 1
        ) {
            task.title =
                'Enabling full_page cache in Magento (Varnish is enabled)'
            return task.newListr(magentoTask('cache:enable full_page'))
        }

        task.skip()
    }
})

module.exports = enableFullPageCacheWithVarnish
