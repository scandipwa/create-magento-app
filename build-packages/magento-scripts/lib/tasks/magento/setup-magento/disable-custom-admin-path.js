const { deleteTableValues } = require('../../../util/database')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const disableCustomAdminPath = () => ({
    title: 'Disabling custom admin path',
    task: async ({ databaseConnection }, task) => {
        await deleteTableValues(
            'core_config_data',
            [
                {
                    path: 'admin/url/use_custom_path'
                }
            ],
            { databaseConnection, task }
        )
    }
})

module.exports = disableCustomAdminPath
