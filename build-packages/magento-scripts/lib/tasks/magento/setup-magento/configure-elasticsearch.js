const runMagentoCommand = require('../../../util/run-magento');

module.exports = {
    title: 'Configuring elasticsearch',
    task: async ({ magentoVersion }) => {
        await runMagentoCommand('config:set catalog/search/engine elasticsearch7', {
            magentoVersion
        });
        await runMagentoCommand('config:set catalog/search/elasticsearch7_server_hostname 127.0.0.1', {
            magentoVersion
        });
    }
};
