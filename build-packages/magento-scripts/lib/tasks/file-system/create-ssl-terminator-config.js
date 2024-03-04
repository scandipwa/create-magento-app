const path = require('path')
const fs = require('fs')
const setConfigFile = require('../../util/set-config')
const pathExists = require('../../util/path-exists')
const KnownError = require('../../errors/known-error')
const UnknownError = require('../../errors/unknown-error')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const createSSLTerminatorConfig = () => ({
    title: 'Setting ssl terminator config',
    task: async (ctx) => {
        const {
            ports,
            config: { overridenConfiguration, baseConfig },
            debug,
            isDockerDesktop
        } = ctx

        const {
            configuration: { sslTerminator },
            ssl
        } = overridenConfiguration

        if (ssl.enabled && !ssl.external_provider) {
            if (!ssl.ssl_certificate) {
                throw new KnownError('ssl.ssl_certificate is not defined!')
            }
            if (!(await pathExists(ssl.ssl_certificate))) {
                throw new KnownError('ssl.ssl_certificate file does not exist!')
            }
            if (!ssl.ssl_certificate_key) {
                throw new KnownError('ssl.ssl_certificate_key is not defined!')
            }
            if (!(await pathExists(ssl.ssl_certificate_key))) {
                throw new KnownError(
                    'ssl.ssl_certificate_key file does not exist!'
                )
            }

            const sslTerminatorCacheDir = path.join(
                baseConfig.cacheDir,
                'ssl-terminator',
                'conf.d'
            )
            if (!(await pathExists(sslTerminatorCacheDir))) {
                await fs.promises.mkdir(sslTerminatorCacheDir, {
                    recursive: true
                })
            }

            await fs.promises.copyFile(
                ssl.ssl_certificate,
                path.join(
                    baseConfig.cacheDir,
                    'ssl-terminator',
                    'conf.d',
                    'ssl_certificate.pem'
                )
            )
            await fs.promises.copyFile(
                ssl.ssl_certificate_key,
                path.join(
                    baseConfig.cacheDir,
                    'ssl-terminator',
                    'conf.d',
                    'ssl_certificate-key.pem'
                )
            )
        }

        const containers = ctx.config.docker.getContainers(ports)

        const enableVarnish =
            !debug && overridenConfiguration.configuration.varnish.enabled

        let appBackendHost = '127.0.0.1'
        let appBackendPort = ports.app

        if (isDockerDesktop) {
            if (enableVarnish) {
                appBackendHost = containers.varnish.name
            } else {
                appBackendHost = containers.nginx.name
            }
            appBackendPort = 80
        } else {
            if (enableVarnish) {
                appBackendPort = ports.varnish
            }
        }

        const sslTerminatorPort = isDockerDesktop ? 80 : ports.sslTerminator

        try {
            await setConfigFile({
                configPathname: path.join(
                    baseConfig.cacheDir,
                    'ssl-terminator',
                    'conf.d',
                    'default.conf'
                ),
                template: sslTerminator.configTemplate,
                overwrite: true,
                templateArgs: {
                    appBackendHost,
                    appBackendPort,
                    ports,
                    sslTerminatorPort,
                    config: overridenConfiguration,
                    debug
                }
            })
        } catch (e) {
            throw new UnknownError(
                `Unexpected error appeared during ssl terminator config creation\n\n${e}`
            )
        }

        // fixes ngrok error "ngrok.io redirected you too many times"
        try {
            await setConfigFile({
                configPathname: path.join(
                    baseConfig.cacheDir,
                    'ssl-terminator',
                    'fastcgi_params'
                ),
                template: path.join(
                    baseConfig.templateDir,
                    'nginx.fastcgi_params.template'
                ),
                overwrite: true,
                templateArgs: {
                    sslEnabled: ssl.enabled
                }
            })
        } catch (e) {
            throw new UnknownError(
                `Unexpected error appeared during ssl terminator fastcgi_params config creation\n\n${e}`
            )
        }
    }
})

module.exports = createSSLTerminatorConfig
