/* eslint-disable no-param-reassign */
const magentoTask = require('../../../util/magento-task');

const upgradeMagento = {
    task: (ctx, task) => task.newListr([magentoTask('setup:upgrade')])
};

module.exports = upgradeMagento;
