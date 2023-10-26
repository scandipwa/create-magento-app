const magentoTask = require('../../../util/magento-task')
// const runMagentoCommand = require('../../../util/run-magento')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const indexProducts = () => ({
    title: 'Index Products',
    task: async (ctx, task) => {
        const { databaseConnection } = ctx
        /** @type {{ indexer_id: string, status: string }[][]} */
        const data = await databaseConnection.query(
            `select indexer_id,status from indexer_state;`
        )

        if (data.length === 0) {
            task.skip('No indexers found')
            return
        }

        const invalidIndexers = data[0].filter(
            ({ status }) => status !== 'valid'
        )

        const doYouWantToSkipIndexingPart = await task.prompt({
            type: 'Select',
            message: `Do you want to index the products? (There are ${invalidIndexers.length} invalid indexers, total indexers: ${data[0].length})\n`,
            choices: [
                {
                    name: 'index',
                    message: 'Yes, index them please'
                },
                {
                    name: 'skip',
                    message:
                        'Skip, do not index them. I will do it later myself'
                }
            ]
        })

        if (doYouWantToSkipIndexingPart === 'skip') {
            task.skip()
            return
        }

        return task.newListr(magentoTask('index:reindex'))
    },
    retry: 2
})

module.exports = indexProducts
