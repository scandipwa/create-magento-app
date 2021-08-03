const magentoTask = require('../../../util/magento-task');

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const disablePageCache = {
    title: 'Disabling full_page cache in Magento',
    task: (ctx, task) => task.newListr(magentoTask('cache:disable full_page'))
};

module.exports = disablePageCache;
