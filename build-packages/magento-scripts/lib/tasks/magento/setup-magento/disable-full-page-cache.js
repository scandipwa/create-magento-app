const envPhpToJson = require('../../../util/env-php-json');
const magentoTask = require('../../../util/magento-task');

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const disableFullPageCache = () => ({
    title: 'Disabling full_page cache in Magento',
    task: async ({ magentoVersion }, task) => {
        const { cache_types } = await envPhpToJson(process.cwd(), { magentoVersion });

        if (cache_types.full_page !== 0) {
            return task.newListr(magentoTask('cache:disable full_page'));
        }

        task.skip();
    }
});

module.exports = disableFullPageCache;
