/* eslint-disable no-param-reassign */
const runMagentoCommand = require('../../../util/run-magento');

const upgradeMagento = {
    title: 'Upgrading magento',
    task: async ({ magentoVersion }, task) => {
        try {
            await runMagentoCommand('setup:upgrade', {
                magentoVersion,
                callback: (t) => {
                    task.output = t;
                }
            });
        } catch (e) {
            throw new Error(
                `Unexpected error while upgrading magento.
                See ERROR log below.\n\n${e}`
            );
        }
    }
};

module.exports = upgradeMagento;
