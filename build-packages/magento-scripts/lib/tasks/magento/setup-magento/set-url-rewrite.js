const runMagentoCommand = require('../../../util/run-magento');

const setUrlRewrite = {
    title: 'Setting up url-rewrites',
    task: async ({ magentoVersion }, task) => {
        const { result } = await runMagentoCommand('config:show  web/seo/use_rewrites', {
            throwNonZeroCode: false,
            magentoVersion
        });

        if (result === '1') {
            task.skip();
            return;
        }

        await runMagentoCommand('config:set web/seo/use_rewrites 1', { magentoVersion });
    }
};

module.exports = setUrlRewrite;
