/* eslint-disable consistent-return */
const magentoTask = require('../../../util/magento-task');
const runMagentoCommand = require('../../../util/run-magento');

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
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
            return task.newListr([
                magentoTask('setup:di:compile'),
                magentoTask('setup:static-content:deploy')
            ]);
        }
    }
};
