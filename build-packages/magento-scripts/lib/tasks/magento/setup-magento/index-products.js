/* eslint-disable no-param-reassign */
const runMagentoCommand = require('../../../util/run-magento');

const indexProducts = {
    title: 'Running magento index:reindex command...',
    task: async (ctx, task) => {
        const { magentoVersion } = ctx;

        await runMagentoCommand('index:reindex', {
            magentoVersion,
            callback: (t) => {
                task.output = t;
            }
        });
    },
    options: {
        bottomBar: 10
    }
};

module.exports = indexProducts;
