const { updateTableValues } = require('../../../util/database')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const setUrlRewrite = () => ({
    title: 'Setting up url-rewrites',
    task: async ({ databaseConnection }, task) => {
        await updateTableValues(
            'core_config_data',
            [
                {
                    path: 'web/seo/use_rewrites',
                    value: '1'
                }
            ],
            { databaseConnection, task }
        )
    }
})

module.exports = setUrlRewrite
