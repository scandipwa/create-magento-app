const magentoTask = require('../../../util/magento-task');

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const upgradeMagento = () => ({
    skip: (ctx) => {
        if ('isSetupUpgradeNeeded' in ctx) {
            return !ctx.isSetupUpgradeNeeded;
        }

        return false;
    },
    task: (_ctx, task) => task.newListr([
        magentoTask('setup:upgrade --no-interaction'),
        {
            task: (ctx) => {
                ctx.isSetupUpgradeNeeded = false;
            }
        }
    ], {
        concurrent: false
    })
});

module.exports = upgradeMagento;
