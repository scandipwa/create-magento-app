const envPhpToJson = require('../../../util/env-php-json');
const magentoTask = require('../../../util/magento-task');

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const disableFullPageCache = () => ({
    title: 'Adjusting full_page cache setting',
    task: async ({ magentoVersion, config }, task) => {
        const { cache_types } = await envPhpToJson(process.cwd(), { magentoVersion });

        if (cache_types.full_page !== 0 && !config.overridenConfiguration.configuration.varnish.enabled) {
            task.title = 'Disabling full_page cache in Magento';
            return task.newListr(magentoTask('cache:disable full_page'));
        }

        if (config.overridenConfiguration.configuration.varnish.enabled && cache_types.full_page !== 1) {
            task.title = 'Enabling full_page cache in Magento (Varnish is enabled)';
            return task.newListr(magentoTask('cache:enable full_page'));
        }

        task.skip();
    }
});

module.exports = disableFullPageCache;
