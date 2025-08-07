const path = require('path')
const fs = require('fs')
const semver = require('semver')
const setConfigFile = require('../../util/set-config')
const pathExists = require('../../util/path-exists')
const KnownError = require('../../errors/known-error')
const UnknownError = require('../../errors/unknown-error')
const { run } = require('../docker/containers/container-api')

/**
 * @returns {import('listr2').ListrTask<import('../../../typings/context').ListrContext>}
 */
const createSSLTerminatorConfig = () => ({
    title: 'Setting ssl terminator config',
    task: async (ctx) => {
        const {
            ports,
            config: { overridenConfiguration, baseConfig, docker },
            isDockerDesktop
        } = ctx

        const { ssl } = overridenConfiguration

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

        const networkSettings = {
            backendNetwork: '127.0.0.1',
            backendPort: overridenConfiguration.configuration.varnish.enabled
                ? ports.varnish
                : ports.app
        }

        if (isDockerDesktop) {
            const containers = docker.getContainers(ports)

            if (overridenConfiguration.configuration.varnish.enabled) {
                networkSettings.backendNetwork = containers.varnish.name
                networkSettings.backendPort = 80
            } else {
                networkSettings.backendNetwork = containers.nginx.name
                networkSettings.backendPort = 80
            }
        }
        const hostPort = !isDockerDesktop ? ports.sslTerminator : 80

        const { sslTerminator } = docker.getContainers(ports)

        const nginxVersionOutput = await run({
            image: sslTerminator.image,
            command: 'nginx -v',
            detach: false,
            rm: true
        })

        const nginxVersionMatch = nginxVersionOutput.match(
            /nginx version: nginx\/(\d+\.\d+\.\d+)/
        )
        if (!nginxVersionMatch) {
            throw new UnknownError(
                `Unexpected error appeared during ssl terminator config creation\n\n${nginxVersionOutput}`
            )
        }

        const nginxVersion = nginxVersionMatch[1]

        const isSSLDirectiveDeprecated = semver.satisfies(
            nginxVersion,
            '>=1.25.0'
        )

        try {
            await setConfigFile({
                configPathname: path.join(
                    baseConfig.cacheDir,
                    'ssl-terminator',
                    'conf.d',
                    'default.conf'
                ),
                template:
                    overridenConfiguration.configuration.sslTerminator
                        .configTemplate,
                overwrite: true,
                templateArgs: {
                    ports,
                    ...networkSettings,
                    hostPort,
                    config: overridenConfiguration,
                    isSSLDirectiveDeprecated
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
