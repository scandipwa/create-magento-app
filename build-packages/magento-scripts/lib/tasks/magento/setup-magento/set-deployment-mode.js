const runMagentoCommand = require('../../../util/run-magento');

module.exports = {
    title: 'Switching magento mode',
    task: async ({ magentoVersion, config: { magentoConfiguration } }, task) => {
        const { result } = await runMagentoCommand('deploy:mode:show', {
            throwNonZeroCode: false,
            magentoVersion
        });

        if (result.includes(magentoConfiguration.mode)) {
            task.skip();
            return;
        }

        await runMagentoCommand(`deploy:mode:set ${ magentoConfiguration.mode } --skip-compilation`, {
            magentoVersion
        });

        if (magentoConfiguration.mode === 'production') {
            await runMagentoCommand('setup:di:compile', {
                magentoVersion
            });
            await runMagentoCommand('setup:static-content:deploy', {
                magentoVersion
            });
        }
    }
};
