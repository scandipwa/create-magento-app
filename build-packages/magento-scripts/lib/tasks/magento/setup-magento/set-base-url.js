const { updateTableValues, databaseQuery } = require('../../../util/database')
const KnownError = require('../../../errors/known-error')

/**
 * @param {number} scopeId
 * @param {string} code
 * @param {string} host
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const setBaseUrlForScope = (scopeId, code, host) => ({
    title: `store code ${code} at ${host}`,
    task: async (ctx, task) => {
        const {
            ports,
            config: {
                overridenConfiguration: { ssl }
            }
        } = ctx

        if (host.startsWith('http://') || host.startsWith('https://')) {
            throw new KnownError(
                `Host ${host} should not contain protocol, only domain name. Check your configuration in cma.js!`
            )
        }

        const location = `${host}${
            ssl.enabled || ports.sslTerminator === 80
                ? ''
                : `:${ports.sslTerminator}`
        }/`
        const secureLocation = `${host}/` // SSL will work only on port 443, so you cannot run multiple projects with SSL at the same time.
        const httpUrl = `http://${location}`
        const httpsUrl = `https://${secureLocation}`
        const scope = scopeId === 0 ? 'default' : 'websites'
        const table = 'core_config_data'
        const values = [
            {
                path: 'web/unsecure/base_url',
                value: httpUrl
            },
            {
                path: 'web/unsecure/base_link_url',
                value: httpUrl
            },
            {
                path: 'web/secure/base_url',
                value: httpsUrl
            },
            {
                path: 'web/secure/base_link_url',
                value: httpsUrl
            }
        ]

        task.title = `store ${code} at ${ssl.enabled ? httpsUrl : httpUrl}`

        await Promise.all(
            values.map(async ({ path, value }) => {
                await databaseQuery(
                    {
                        table,
                        where: [
                            ['scope_id', '=', scopeId],
                            ['path', '=', path]
                        ],
                        data: {
                            value,
                            scope
                        }
                    },
                    ctx
                )
            })
        )
    }
})

/**
 * @returns {import('listr2').ListrTask<import('../../../../typings/context').ListrContext>}
 */
const setBaseUrl = () => ({
    title: 'Setting base url for stores',
    task: async (ctx, task) => {
        const {
            config: {
                overridenConfiguration: { ssl, storeDomains }
            },
            databaseConnection
        } = ctx

        const enableSecureFrontend = ssl.enabled ? '1' : '0'

        await updateTableValues(
            'core_config_data',
            [
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

        /** @type {{ website_id: number, code: string }[][]}} */
        const [storeWebsites] = await databaseConnection.query(
            `select * from store_website;`
        )

        if (!storeWebsites || storeWebsites.length === 0) {
            throw new KnownError(
                `No store websites found in database, store_website table is empty or does not exist`
            )
        }

        const storeDomainsWithMapping = Object.entries(storeDomains).reduce(
            (acc, [key, val]) => {
                const storeWebsite = storeWebsites.find(
                    ({ code }) => code === key
                )
                if (storeWebsite) {
                    return {
                        ...acc,
                        [storeWebsite.code]: {
                            websiteId: storeWebsite.website_id,
                            domain: val
                        }
                    }
                }

                return acc
            },
            {}
        )

        return task.newListr(
            Object.entries(storeDomainsWithMapping).map(
                ([storeCode, { websiteId, domain }]) =>
                    setBaseUrlForScope(websiteId, storeCode, domain)
            ),
            {
                concurrent: true,
                rendererOptions: {
                    collapse: false
                }
            }
        )
    }
})

module.exports = setBaseUrl
