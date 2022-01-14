const { isTableExists } = require('../../../util/database');

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const adjustMagentoConfiguration = () => ({
    title: 'Adjusting Magento Database Configuration',
    skip: async (ctx) => !(await isTableExists('magento', 'core_config_data', ctx)),
    task: async (ctx) => {
        const { mysqlConnection } = ctx;

        // delete varnish configuration if exists
        await mysqlConnection.query(`
            DELETE FROM core_config_data WHERE path LIKE '%varnish%';
        `);

        // update cache policy to not use varnish
        // 0 - magento cache, 2 - varnish cache
        await mysqlConnection.query(`
            UPDATE core_config_data
            SET value = ?
            WHERE path = ?;
        `, ['0', 'system/full_page_cache/caching_application']);
    }
});

module.exports = adjustMagentoConfiguration;
