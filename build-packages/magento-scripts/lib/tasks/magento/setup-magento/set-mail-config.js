const { updateTableValues } = require('../../../util/database');

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const setMailConfig = () => ({
    title: 'Setting up mail configuration',
    task: async ({ databaseConnection, ports, isDockerDesktop }, task) => {
        await updateTableValues('core_config_data', [
            {
                path: 'system/smtp/port',
                value: `${ ports.maildevSMTP }`
            },
            {
                path: 'system/smtp/disable',
                value: '0'
            },
            {
                path: 'system/smtp/host',
                value: isDockerDesktop ? 'host.docker.internal' : 'localhost'
            }
        ], { databaseConnection, task });
    }
});

module.exports = setMailConfig;
