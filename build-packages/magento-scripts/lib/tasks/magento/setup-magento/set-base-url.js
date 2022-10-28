const { updateTableValues } = require('../../../util/database')

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
module.exports = () => ({
    title: 'Setting baseurl and secure baseurl',
    task: async (ctx, task) => {
        const {
            ports,
            config: {
                overridenConfiguration: { host, ssl }
            },
            databaseConnection
        } = ctx
        const isNgrok = host.endsWith('ngrok.io')
        const enableSecureFrontend = isNgrok || ssl.enabled ? '1' : '0'
        const location = `${host}${
            !isNgrok && ports.sslTerminator !== 80
                ? `:${ports.sslTerminator}`
                : ''
        }/`
        const secureLocation = `${host}/` // SSL will work only on port 443, so you cannot run multiple projects with SSL at the same time.
        const httpUrl = `http://${location}`
        const httpsUrl = `https://${secureLocation}`

        await updateTableValues(
            'core_config_data',
            [
                { path: 'web/unsecure/base_url', value: httpUrl },
                { path: 'web/secure/base_url', value: httpsUrl },
                {
                    path: 'web/secure/use_in_frontend',
                    value: enableSecureFrontend
                },
                {
                    path: 'web/secure/use_in_adminhtml',
                    value: enableSecureFrontend
                },
                {
                    path: 'web/secure/enable_upgrade_insecure',
                    value: enableSecureFrontend
                },
                { path: 'web/cookie/cookie_domain', value: null }
            ],
            { databaseConnection, task }
        )
    }
})
