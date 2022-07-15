const envPhpToJson = require('../../../util/env-php-json');
const magentoTask = require('../../../util/magento-task');

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const disableFullPageCache = () => ({
    title: 'Adjusting full_page cache setting',
    task: async (ctx, task) => {
        const { cache_types } = await envPhpToJson(ctx);
        if (cache_types && typeof cache_types.full_page === 'number') {
            if (cache_types.full_page !== 0 && !ctx.config.overridenConfiguration.configuration.varnish.enabled) {
                task.title = 'Disabling full_page cache in Magento';
                return task.newListr(magentoTask('cache:disable full_page'));
            }

            if (ctx.config.overridenConfiguration.configuration.varnish.enabled && cache_types.full_page !== 1) {
                task.title = 'Enabling full_page cache in Magento (Varnish is enabled)';
                return task.newListr(magentoTask('cache:enable full_page'));
            }
        } else {
            task.skip('full_page cache type is not set in env.php');
            return;
        }

        task.skip();
    }
});

module.exports = disableFullPageCache;
