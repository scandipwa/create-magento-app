/* eslint-disable no-param-reassign */
const runMagentoCommand = require('../../../util/run-magento');

/**
 * TODO move this block inside theme folder as post installation command
 */
const themeSubtask = {
    title: 'Setting up redis for persisted queries',
    task: async ({ ports }, task) => {
        try {
            await runMagentoCommand(`setup:config:set \
        --pq-host=localhost \
        --pq-port=${ports.redis} \
        --pq-database=5 \
        --pq-scheme=tcp \
        -n`, {
                callback: (t) => {
                    task.output = t;
                }
            });
        } catch (e) {
            throw new Error(
                `Unexpected error while setting redis for pq!.
                See ERROR log below.\n\n${e}`
            );
        }
    }
};

module.exports = themeSubtask;
