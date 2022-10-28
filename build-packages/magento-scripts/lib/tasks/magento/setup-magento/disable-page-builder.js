const magentoTask = require('../../../util/magento-task')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const disablePageBuilder = () => ({
    title: 'Disabling page builder in Magento',
    task: (ctx, task) =>
        task.newListr(magentoTask('config:set cms/pagebuilder/enabled 0'))
})

module.exports = disablePageBuilder
