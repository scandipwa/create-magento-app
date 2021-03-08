// const runMagentoCommand = require('../../../util/run-magento');

module.exports = {
    title: 'Configuring elasticsearch',
    task: async ({ ports, mysqlConnection }, task) => {
        // const [
        //     { result: catalogSearchEngine },
        //     { result: catalogSearchElasticsearch7ServerHostname },
        //     { result: catalogSearchElasticsearch7ServerPort }
        // ] = await Promise.all([
        //     runMagentoCommand('config:show catalog/search/engine', {
        //         throwNonZeroCode: false,
        //         magentoVersion
        //     }),
        //     runMagentoCommand('config:show catalog/search/elasticsearch7_server_hostname', {
        //         throwNonZeroCode: false,
        //         magentoVersion
        //     }),
        //     runMagentoCommand('config:show catalog/search/elasticsearch7_server_port', {
        //         throwNonZeroCode: false,
        //         magentoVersion
        //     })
        // ]);

        const [rows] = await mysqlConnection.query(`
            SELECT * FROM core_config_data
            WHERE path = 'catalog/search/engine'
            OR path = 'catalog/search/elasticsearch7_server_hostname'
            OR path = 'catalog/search/elasticsearch7_server_port';
        `);

        const [
            catalogSearchEngine,
            catalogSearchElasticsearch7ServerHostname,
            catalogSearchElasticsearch7ServerPort
        ] = rows;

        if (
            catalogSearchEngine.value === 'elasticsearch7'
            && catalogSearchElasticsearch7ServerHostname.value === '127.0.0.1'
            && catalogSearchElasticsearch7ServerPort.value === `${ports.elasticsearch}`
        ) {
            task.skip();
            return;
        }

        if (catalogSearchEngine.value !== 'elasticsearch7') {
            await mysqlConnection.query(`
                UPDATE core_config_data
                SET value = 'elasticsearch7'
                WHERE path = 'catalog/search/engine';
            `);
            // await runMagentoCommand('config:set catalog/search/engine elasticsearch7', {
            //     magentoVersion
            // });
        }
        if (catalogSearchElasticsearch7ServerHostname.value !== '127.0.0.1') {
            await mysqlConnection.query(`
                UPDATE core_config_data
                SET value = '127.0.0.1'
                WHERE path = 'catalog/search/elasticsearch7_server_hostname';
            `);
            // await runMagentoCommand('config:set catalog/search/elasticsearch7_server_hostname 127.0.0.1', {
            //     magentoVersion
            // });
        }
        if (catalogSearchElasticsearch7ServerPort.value !== ports.elasticsearch) {
            await mysqlConnection.query(`
                UPDATE core_config_data
                SET value = ?
                WHERE path = 'catalog/search/elasticsearch7_server_port';
            `, [`${ports.elasticsearch}`]);
            // await runMagentoCommand(`config:set catalog/search/elasticsearch7_server_port ${ports.elasticsearch}`, {
            //     magentoVersion
            // });
        }
    }
};
