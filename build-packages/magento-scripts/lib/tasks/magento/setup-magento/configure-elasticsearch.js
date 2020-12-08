const runMagentoCommand = require('../../../util/run-magento');

module.exports = {
    title: 'Configuring elasticsearch',
    task: async ({ magentoVersion, ports }) => {
        await runMagentoCommand('config:set catalog/search/engine elasticsearch7', {
            magentoVersion,
            throwNonZeroCode: false
        });
        await runMagentoCommand('config:set catalog/search/elasticsearch7_server_hostname 127.0.0.1', {
            magentoVersion,
            throwNonZeroCode: false
        });

        await runMagentoCommand(`setup:config:set \
        --search-engine='elasticsearch7' \
        --elasticsearch-host='127.0.0.1' \
        --elasticsearch-port='${ ports.elasticsearch }' \
        -n`, {
            magentoVersion,
            throwNonZeroCode: false
        });
    }
};
