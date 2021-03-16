/* eslint-disable no-param-reassign */
const magentoTask = require('../../../util/magento-task');

const indexProducts = {
    task: (ctx, task) => task.newListr([
        magentoTask('index:reindex')
    ])
};

module.exports = indexProducts;
