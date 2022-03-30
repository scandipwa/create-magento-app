const { updateTableValues } = require('../../../util/database');

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const setMailConfig = () => ({
    title: 'Setting up mail configuration',
    task: async ({ mysqlConnection, ports }, task) => {
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
                value: 'localhost'
            }
        ], { mysqlConnection, task });
    }
});

module.exports = setMailConfig;
