const runMagentoCommand = require('../../../util/run-magento');

module.exports = {
    title: 'Configuring elasticsearch',
    task: async ({ magentoVersion, ports }, task) => {
        const [
            { result: catalogSearchEngine },
            { result: catalogSearchElasticsearch7ServerHostname },
            { result: catalogSearchElasticsearch7ServerPort }
        ] = await Promise.all([
            runMagentoCommand('config:show catalog/search/engine', {
                throwNonZeroCode: false,
                magentoVersion
            }),
            runMagentoCommand('config:show catalog/search/elasticsearch7_server_hostname', {
                throwNonZeroCode: false,
                magentoVersion
            }),
            runMagentoCommand('config:show catalog/search/elasticsearch7_server_port', {
                throwNonZeroCode: false,
                magentoVersion
            })
        ]);

        if (
            catalogSearchEngine === 'elasticsearch7'
            && catalogSearchElasticsearch7ServerHostname === '127.0.0.1'
            && catalogSearchElasticsearch7ServerPort === ports.elasticsearch
        ) {
            task.skip();
            return;
        }

        if (catalogSearchEngine !== 'elasticsearch7') {
            await runMagentoCommand('config:set catalog/search/engine elasticsearch7', {
                magentoVersion
            });
        }
        if (catalogSearchElasticsearch7ServerHostname !== '127.0.0.1') {
            await runMagentoCommand('config:set catalog/search/elasticsearch7_server_hostname 127.0.0.1', {
                magentoVersion
            });
        }
        if (catalogSearchElasticsearch7ServerPort !== ports.elasticsearch) {
            await runMagentoCommand(`config:set catalog/search/elasticsearch7_server_port ${ports.elasticsearch}`, {
                magentoVersion
            });
        }
    }
};
