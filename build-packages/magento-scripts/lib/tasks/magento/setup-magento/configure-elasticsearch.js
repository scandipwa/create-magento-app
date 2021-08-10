const { updateTableValues } = require('../../../util/database');

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
module.exports = () => ({
    title: 'Configuring elasticsearch',
    task: async ({ ports, mysqlConnection }, task) => {
        await updateTableValues('core_config_data', [
            { path: 'catalog/search/engine', value: 'elasticsearch7' },
            { path: 'catalog/search/elasticsearch7_server_hostname', value: '127.0.0.1' },
            { path: 'catalog/search/elasticsearch7_server_port', value: `${ports.elasticsearch}` }
        ], { mysqlConnection, task });
    }
});
