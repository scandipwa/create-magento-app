const { deleteTableValues } = require('../../../util/database')

/**
 * Imported dumps can have static and media urls pointing to production domain,
 * without them Magento derives these urls from base_url
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const resetStaticMediaUrls = () => ({
    title: 'Resetting static and media base urls',
    task: async ({ databaseConnection }, task) => {
        await deleteTableValues(
            'core_config_data',
            [
                { path: 'web/unsecure/base_static_url' },
                { path: 'web/secure/base_static_url' },
                { path: 'web/unsecure/base_media_url' },
                { path: 'web/secure/base_media_url' }
            ],
            { databaseConnection, task }
        )
    }
})

module.exports = resetStaticMediaUrls
