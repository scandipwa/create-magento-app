const runMagentoCommand = require('../../../util/run-magento');

module.exports = {
    title: 'Setting baseurl and secure baseurl',
    task: async ({ ports, magentoVersion }) => {
        const url = `localhost${ ports.app !== 80 ? `:${ports.app}` : '' }`;
        await runMagentoCommand(`setup:store-config:set --base-url="http://${url}"`, { magentoVersion });
        await runMagentoCommand(`setup:store-config:set --base-url-secure="https://${url}"`, { magentoVersion });
        await runMagentoCommand('setup:store-config:set --use-secure=0', { magentoVersion });
        await runMagentoCommand('setup:store-config:set --use-secure-admin=0', { magentoVersion });
    }
};
