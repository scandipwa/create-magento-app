const path = require('path')
const fs = require('fs')
const setConfigFile = require('../../util/set-config')
const pathExists = require('../../util/path-exists')
const { isIpAddress } = require('../../util/ip')
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
            ssl,
            host
        } = overridenConfiguration

        if (ssl.enabled) {
            if (!(await pathExists(ssl.ssl_certificate))) {
                throw new KnownError('ssl.ssl_certificate file does not exist!')
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

        const networkToBindTo = isIpAddress(host) ? host : '127.0.0.1'
        const hostMachine = !isDockerDesktop
            ? '127.0.0.1'
            : 'host.docker.internal'
        const hostPort = !isDockerDesktop ? ports.sslTerminator : 80

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
                    ports,
                    hostMachine,
                    hostPort,
                    config: overridenConfiguration,
                    networkToBindTo,
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
                    isNgrok: host.endsWith('ngrok.io')
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
