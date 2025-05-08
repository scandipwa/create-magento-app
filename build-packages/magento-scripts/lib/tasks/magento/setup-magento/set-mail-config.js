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
                    path: 'system/smtp/transport',
                    value: 'smtp'
                },
                {
                    path: 'system/smtp/host',
                    value: isDockerDesktop
                        ? 'host.docker.internal'
                        : '127.0.0.1'
                },
                {
                    path: 'system/smtp/port',
                    value: `${ports.maildevSMTP}`
                },
                {
                    path: 'smtp/configuration_option/host',
                    value: isDockerDesktop
                        ? 'host.docker.internal'
                        : '127.0.0.1'
                },
                {
                    path: 'smtp/configuration_option/port',
                    value: `${ports.maildevSMTP}`
                }
            ],
            { databaseConnection, task }
        )
    }
})

module.exports = setMailConfig
