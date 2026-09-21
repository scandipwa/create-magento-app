const { execAsyncSpawn } = require('../../util/exec-async-command')
const { applyEnsureConfigPhpTracked } = require('../../util/ensure-config-php-tracked')

/**
 * Magento 2.4 still gitignores app/etc/config.php. CMA must un-ignore it
 * after magento2-base copy and git-add the file once setup:install creates it.
 *
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const ensureConfigPhpTracked = () => ({
    title: 'Ensuring app/etc/config.php is tracked',
    task: async (ctx, task) => {
        const magentoDir =
            (ctx.config &&
                ctx.config.baseConfig &&
                ctx.config.baseConfig.magentoDir) ||
            process.cwd()
        const notes = await applyEnsureConfigPhpTracked(magentoDir, {
            runCommand: (command, cwd) =>
                execAsyncSpawn(command, {
                    cwd,
                    withCode: true
                })
        })
        task.output = notes.join('; ')
    },
    options: {
        bottomBar: 5
    }
})

module.exports = ensureConfigPhpTracked
