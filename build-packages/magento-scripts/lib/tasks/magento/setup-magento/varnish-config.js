const { updateTableValues } = require('../../../util/database');

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const varnishConfigSetup = () => ({
    title: 'Varnish setup',
    task: async (ctx, task) => {
        const {
            config: {
                overridenConfiguration: {
                    configuration: {
                        varnish: {
                            enabled: varnishEnabled
                        }
                    }
                }
            },
            mysqlConnection,
            ports
        } = ctx;

        if (varnishEnabled) {
            await updateTableValues('core_config_data', [
                {
                    path: 'system/full_page_cache/varnish/backend_host',
                    value: 'localhost'
                },
                {
                    path: 'system/full_page_cache/varnish/backend_port',
                    value: ports.varnish
                },
                {
                    path: 'system/full_page_cache/varnish/access_list',
                    value: 'localhost'
                },
                {
                    path: 'system/full_page_cache/caching_application',
                    value: '2'
                }
            ], { mysqlConnection, task });
        } else {
            // delete varnish configuration if exists
            await mysqlConnection.query(`
                DELETE FROM core_config_data WHERE path LIKE '%varnish%';
            `);

            // update cache policy to not use varnish
            // 0 - magento cache, 2 - varnish cache
            await updateTableValues('core_config_data', [
                {
                    path: 'system/full_page_cache/caching_application',
                    value: '0'
                }
            ], { mysqlConnection, task });
        }
    },
    options: {
        bottomBar: 10
    }
});

module.exports = varnishConfigSetup;
