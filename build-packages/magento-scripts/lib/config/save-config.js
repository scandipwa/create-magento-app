const { savePortsConfig } = require('./port-config')

/**
 * @returns {import('listr2').ListrTask<import('../../typings/context').ListrContext>}
 */
const saveConfiguration = () => ({
    title: 'Saving configuration',
    task: async (ctx) => {
        const { ports } = ctx

        await savePortsConfig(ports)
    }
})

module.exports = {
    saveConfiguration
}
