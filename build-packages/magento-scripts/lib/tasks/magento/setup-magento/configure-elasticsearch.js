const runMagentoCommand = require('../../../util/run-magento');

module.exports = {
    title: 'Configuring elasticsearch',
    task: async ({ magentoVersion }, task) => {
        const [
            { result: catalogSearchEngine },
            { result: catalogSearchElasticsearch7ServerHostname }
        ] = await Promise.all([
            runMagentoCommand('config:show catalog/search/engine', {
                throwNonZeroCode: false,
                magentoVersion
            }),
            runMagentoCommand('config:show catalog/search/elasticsearch7_server_hostname', {
                throwNonZeroCode: false,
                magentoVersion
            })
        ]);

        if (
            catalogSearchEngine === 'elasticsearch7'
            && catalogSearchElasticsearch7ServerHostname === '127.0.0.1'
        ) {
            task.skip();
            return;
        }

        await runMagentoCommand('config:set catalog/search/engine elasticsearch7', {
            magentoVersion
        });
        await runMagentoCommand('config:set catalog/search/elasticsearch7_server_hostname 127.0.0.1', {
            magentoVersion
        });
    }
};
