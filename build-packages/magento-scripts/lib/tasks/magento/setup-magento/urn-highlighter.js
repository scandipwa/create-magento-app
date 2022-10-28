const fs = require('fs')
const path = require('path')
const magentoTask = require('../../../util/magento-task')
const pathExists = require('../../../util/path-exists')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 *
 * @reference https://devdocs.magento.com/guides/v2.4/config-guide/cli/config-cli-subcommands-urn.html
 */
const urnHighlighter = () => ({
    title: 'Generating URN highlighter',
    task: async (ctx, task) => {
        if (!(await pathExists(path.join(process.cwd(), './.idea')))) {
            await fs.promises.mkdir(path.join(process.cwd(), './.idea'))
        }

        if (await pathExists(path.join(process.cwd(), './.idea/misc.xml'))) {
            task.skip()
            return
        }

        return task.newListr(
            magentoTask('dev:urn-catalog:generate -- ./.idea/misc.xml')
        )
    }
})

module.exports = urnHighlighter
