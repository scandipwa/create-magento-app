const { runPHPContainerCommand } = require('../../php/php-container')

/**
 * Removes generated interceptors, factories, proxies and compiled DI metadata,
 * so stale classes left after branch switch or composer update won't be used.
 * Magento regenerates them on demand in developer and default modes.
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
module.exports = () => ({
    title: 'Cleaning generated code',
    skip: (ctx) => {
        if (ctx.config.magentoConfiguration.mode === 'production') {
            return 'Skipped in production mode, generated code is compiled ahead of time'
        }

        return false
    },
    task: async (ctx) => {
        await runPHPContainerCommand(
            ctx,
            'rm -rf generated/code generated/metadata'
        )
    }
})
