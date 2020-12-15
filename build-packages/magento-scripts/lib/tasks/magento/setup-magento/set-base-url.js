const runMagentoCommand = require('../../../util/run-magento');

module.exports = {
    title: 'Setting baseurl and secure baseurl',
    task: async ({ ports, magentoVersion }) => {
        const url = `localhost${ ports.app !== 80 ? `:${ports.app}` : '' }/`;
        // config:set with path web/unsecure/base_url
        await runMagentoCommand(`config:set web/unsecure/base_url http://${url}`, { magentoVersion });
        await runMagentoCommand(`config:set web/secure/base_url https://${url}`, { magentoVersion });
        await runMagentoCommand('config:set web/secure/use_in_frontend 0', { magentoVersion });
        await runMagentoCommand('config:set web/secure/use_in_adminhtml 0', { magentoVersion });
    }
};
