const magentoTask = require('../../../util/magento-task')
const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const KnownError = require('../../../errors/known-error')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const upgradeMagento = () => ({
    skip: (ctx) => {
        if (ctx.isSetupUpgradeNeeded !== undefined) {
            return !ctx.isSetupUpgradeNeeded
        }

        return false
    },
    task: (_ctx, task) =>
        task.newListr(
            [
                magentoTask('setup:upgrade --no-interaction', {
                    onError: (e) => {
                        throw new KnownError(`Magento setup:upgrade command failed!
You can try disabling failed module and try again.
To disable module, open ${logger.style.misc(
                            'cli'
                        )} and type the following command: ${logger.style.command(
                            'm module:disable <module-name>'
                        )}

Error: ${e}`)
                    }
                }),
                {
                    task: (ctx) => {
                        ctx.isSetupUpgradeNeeded = false
                    }
                }
            ],
            {
                concurrent: false
            }
        )
})

module.exports = upgradeMagento
