const runMagentoCommand = require('../../../util/run-magento');

const setUrlRewrite = {
    task: async ({ magentoVersion }) => {
        await runMagentoCommand('config:set web/seo/use_rewrites 1', { magentoVersion });
    }
};

module.exports = setUrlRewrite;
