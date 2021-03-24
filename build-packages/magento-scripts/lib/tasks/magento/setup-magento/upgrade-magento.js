/* eslint-disable no-param-reassign */
const magentoTask = require('../../../util/magento-task');

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const upgradeMagento = {
    task: (ctx, task) => task.newListr([magentoTask('setup:upgrade')])
};

module.exports = upgradeMagento;
