const { setProjectConfig } = require('../../config/config')
const { setPrefix: setPrefixUtil } = require('../../util/prefix')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const setProjectConfigTask = () => ({
    title: 'Settings project config',
    task: (ctx) => {
        const {
            config: {
                overridenConfiguration: { prefix }
            }
        } = ctx

        setPrefixUtil(prefix)

        setProjectConfig('debug', ctx.debug)
    },
    options: {
        showTimer: false
    }
})

module.exports = { setProjectConfigTask }
