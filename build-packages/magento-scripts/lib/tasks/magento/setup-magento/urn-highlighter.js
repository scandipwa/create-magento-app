/* eslint-disable consistent-return */
const path = require('path');
const magentoTask = require('../../../util/magento-task');
const pathExists = require('../../../util/path-exists');

/**
 * @type {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 *
 * @reference https://devdocs.magento.com/guides/v2.4/config-guide/cli/config-cli-subcommands-urn.html
 */
const URNHighlighter = {
    title: 'Generating URN highlighter',
    task: async (ctx, task) => {
        if (!await pathExists(path.resolve('./.idea'))) {
            task.skip();
            return;
        }

        return task.newListr(
            magentoTask('dev:urn-catalog:generate -- ./.idea/misc.xml')
        );
    }
};

module.exports = URNHighlighter;
