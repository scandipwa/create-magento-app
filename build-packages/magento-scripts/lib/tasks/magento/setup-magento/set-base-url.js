const { updateTableValues } = require('../../../util/database');

/**
 * @type {() => import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
module.exports = () => ({
    title: 'Setting baseurl and secure baseurl',
    task: async (ctx, task) => {
        const {
            ports,
            config: { overridenConfiguration: { host, ssl } },
            mysqlConnection
        } = ctx;
        const location = `${host}${ ports.app !== 80 ? `:${ports.app}` : '' }/`;
        const httpUrl = `http://${location}`;
        const httpsUrl = `https://${location}`;

        const enableSecureFrontend = ssl.enabled ? '1' : '0';

        await updateTableValues('core_config_data', [
            { path: 'web/unsecure/base_url', value: httpUrl },
            { path: 'web/secure/base_url', value: httpsUrl },
            { path: 'web/secure/use_in_frontend', value: enableSecureFrontend },
            { path: 'web/secure/use_in_adminhtml', value: enableSecureFrontend }
        ], { mysqlConnection, task });
    }
});
