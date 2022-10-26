const { updateTableValues } = require('../../../util/database')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const setMailConfig = () => ({
    title: 'Setting up mail configuration',
    task: async ({ databaseConnection, ports, isDockerDesktop }, task) => {
        await updateTableValues(
            'core_config_data',
            [
                {
                    path: 'smtp/configuration_option/port',
                    value: `${ports.maildevSMTP}`
                },
                {
                    path: 'smtp/configuration_option/host',
                    value: isDockerDesktop
                        ? 'host.docker.internal'
                        : 'localhost'
                }
            ],
            { databaseConnection, task }
        )
    }
})

module.exports = setMailConfig
