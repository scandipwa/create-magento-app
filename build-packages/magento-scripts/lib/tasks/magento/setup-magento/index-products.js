/* eslint-disable no-param-reassign */
const magentoTask = require('../../../util/magento-task');

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const indexProducts = {
    task: (ctx, task) => task.newListr([
        magentoTask('index:reindex')
    ]),
    retry: 2
};

module.exports = indexProducts;
