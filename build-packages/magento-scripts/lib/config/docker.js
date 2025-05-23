const os = require('os')
const path = require('path')
const getPhpConfig = require('./php-config')
const { isIpAddress } = require('../util/ip')

const systeminformation = require('systeminformation')
const { deepmerge } = require('../util/deepmerge')
const defaultEsEnv = require('./services/elasticsearch/default-es-env')
const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const defaultMagentoUser = require('../tasks/database/default-magento-user')
const defaultOsEnv = require('./services/opensearch/default-os-env')

/**
 * @param {Partial<Record<'rw' | 'ro' | 'cached', boolean>>} directives
 */
const volumeDirectives = (directives) => {
    const directivesResult = Object.entries(directives)
        .filter(([name, value]) => value === true)
        .map(([name]) => name)
        .join(',')

    return directivesResult ? `:${directivesResult}` : ''
}

/**
 * @param {{source: string, target: string, rw?: boolean, ro?: boolean, cached?: boolean}} options
 */
const containerVolume = (options) => {
    const { source, target, ...directives } = options

    return `${source}:${target}${volumeDirectives(directives)}`
}

/**
 * @param {import('../../typings/context').ListrContext} ctx
 * @param {import('../../typings/context').ListrContext['config']['overridenConfiguration']} overridenConfiguration
 * @param {import('../../typings/context').ListrContext['config']['baseConfig']} baseConfig
 */
module.exports = async (ctx, overridenConfiguration, baseConfig) => {
    const {
        configuration,
        ssl,
        storeDomains: { admin: host }
    } = overridenConfiguration
    const {
        nginx,
        redis,
        elasticsearch,
        opensearch,
        searchengine = 'elasticsearch',
        mariadb,
        varnish,
        maildev,
        newRelic
    } = configuration

    const php = getPhpConfig(overridenConfiguration, baseConfig)
    const { prefix, magentoDir, containerMagentoDir, cacheDir } = baseConfig

    const cpuSupportedFlags = (await systeminformation.cpuFlags()).split(' ')

    const network = {
        name: `${prefix}_network`
    }

    /**
     * @type {Record<string, { name: string, driver?: string, opt?: { mode?: string, device?: string, o?: string, type?: string } }>}
     */
    const volumes = {
        mariadb: {
            name: `${prefix}_mariadb-data`
        },
        redis: {
            name: `${prefix}_redis-data`
        },
        elasticsearch: {
            name: `${prefix}_elasticsearch-data`
        },
        opensearch: {
            name: `${prefix}_opensearch-data`
        },
        maildev: {
            name: `${prefix}_maildev-data`
        },
        composer_cache: {
            name: 'composer_cache-data'
        }
    }

    const { isDockerDesktop } = ctx

    if (isDockerDesktop) {
        volumes.php = {
            name: `${prefix}_project-data`,
            driver: 'local',
            opt: {
                type: 'none',
                device: path.join(magentoDir),
                o: 'bind'
            }
        }
    }
    /**
     * @param {Record<string, number>} ports
     */
    const getContainers = (ports = {}) => {
        const composerAuthEnv = process.env.COMPOSER_AUTH
            ? {
                  COMPOSER_AUTH: JSON.stringify(
                      JSON.parse(process.env.COMPOSER_AUTH),
                      null,
                      0
                  )
              }
            : {}

        /**
         * @type {Record<string, import('../tasks/docker/containers/container-api').ContainerRunOptions & { _?: string, forwardedPorts?: string[], remoteImages?: string[], connectCommand?: string[], description?: string, pullImage?: boolean, dependsOn?: string[] }>}
         */
        const dockerConfig = {
            php: {
                _: 'PHP',
                ports: isDockerDesktop
                    ? [
                          `${isIpAddress(host) ? host : '127.0.0.1'}:${
                              ports.fpm
                          }:9000`
                      ]
                    : [],
                forwardedPorts: [
                    isDockerDesktop
                        ? `127.0.0.1:${ports.fpm}:9000`
                        : `127.0.0.1:${ports.fpm}`
                ],
                network: isDockerDesktop ? network.name : 'host',
                mountVolumes: [
                    containerVolume({
                        source: isDockerDesktop ? volumes.php.name : magentoDir,
                        target: containerMagentoDir,
                        rw: true,
                        cached: isDockerDesktop
                    }),
                    containerVolume({
                        source: volumes.composer_cache.name,
                        target: '/composer/home/cache',
                        rw: true
                    }),
                    containerVolume({
                        source: php.iniPath,
                        target: '/usr/local/etc/php/php.ini',
                        ro: true,
                        cached: isDockerDesktop
                    }),
                    containerVolume({
                        source: php.fpmConfPath,
                        target: '/usr/local/etc/php-fpm.d/zz-docker.conf',
                        ro: true,
                        cached: isDockerDesktop
                    })
                ],
                env: deepmerge(composerAuthEnv, php.env || {}),
                restart: 'on-failure:5',
                image: `local-cma-project:${prefix}`,
                remoteImages: [configuration.php.baseImage],
                name: `${prefix}_php`,
                connectCommand: ['/bin/sh'],
                dependsOn: ['mariadb', 'redis', 'elasticsearch'],
                user:
                    (ctx.platform === 'linux' && isDockerDesktop) ||
                    !isDockerDesktop
                        ? `${os.userInfo().uid}:${os.userInfo().gid}`
                        : ''
            },
            phpWithXdebug: {
                _: 'PHP with Xdebug',
                ports: isDockerDesktop
                    ? [
                          `${isIpAddress(host) ? host : '127.0.0.1'}:${
                              ports.fpmXdebug
                          }:9000`
                      ]
                    : [],
                forwardedPorts: [
                    isDockerDesktop
                        ? `127.0.0.1:${ports.fpmXdebug}:9000`
                        : `127.0.0.1:${ports.fpmXdebug}`
                ],
                network: isDockerDesktop ? network.name : 'host',
                mountVolumes: [
                    containerVolume({
                        source: isDockerDesktop ? volumes.php.name : magentoDir,
                        target: containerMagentoDir,
                        rw: true,
                        cached: isDockerDesktop
                    }),
                    containerVolume({
                        source: volumes.composer_cache.name,
                        target: '/composer/home/cache',
                        rw: true
                    }),
                    containerVolume({
                        source: php.iniPath,
                        target: '/usr/local/etc/php/php.ini',
                        ro: true,
                        cached: isDockerDesktop
                    }),
                    containerVolume({
                        source: php.debugFpmConfPath,
                        target: '/usr/local/etc/php-fpm.d/zz-docker.conf',
                        ro: true,
                        cached: isDockerDesktop
                    }),
                    containerVolume({
                        source: php.debugIniPath,
                        target: '/usr/local/etc/php/conf.d/00-xdebug.ini',
                        ro: true,
                        cached: isDockerDesktop
                    })
                ],
                env: deepmerge(composerAuthEnv, php.env || {}),
                restart: 'on-failure:5',
                image: `local-cma-project:${prefix}.debug`,
                pullImage: false,
                name: `${prefix}_php_with_xdebug`,
                connectCommand: ['/bin/sh'],
                dependsOn: ['mariadb', 'redis', 'elasticsearch'],
                user:
                    (ctx.platform === 'linux' && isDockerDesktop) ||
                    !isDockerDesktop
                        ? `${os.userInfo().uid}:${os.userInfo().gid}`
                        : ''
            },
            sslTerminator: {
                _: 'SSL Terminator (Nginx)',
                ports: isDockerDesktop
                    ? [
                          `${isIpAddress(host) ? host : '127.0.0.1'}:${
                              ports.sslTerminator
                          }:80`
                      ]
                    : [],
                forwardedPorts: [
                    isDockerDesktop
                        ? `127.0.0.1:${ports.sslTerminator}:80`
                        : `127.0.0.1:${ports.sslTerminator}`
                ],
                healthCheck: {
                    cmd: 'service nginx status'
                },
                mountVolumes: [
                    containerVolume({
                        source: path.join(cacheDir, 'ssl-terminator', 'conf.d'),
                        target: '/etc/nginx/conf.d',
                        ro: true,
                        cached: isDockerDesktop
                    }),
                    containerVolume({
                        source: path.join(
                            cacheDir,
                            'ssl-terminator',
                            'fastcgi_params'
                        ),
                        target: '/etc/nginx/fastcgi_params',
                        ro: true,
                        cached: isDockerDesktop
                    })
                ],
                restart: 'on-failure:5',
                network: isDockerDesktop ? network.name : 'host',
                image: `${
                    nginx.version ? `nginx:${nginx.version}` : nginx.image
                }`,
                name: `${prefix}_ssl-terminator`,
                command: "nginx -g 'daemon off;'",
                dependsOn: ['nginx']
            },
            nginx: {
                _: 'Nginx',
                ports: isDockerDesktop
                    ? [
                          `${isIpAddress(host) ? host : '127.0.0.1'}:${
                              ports.app
                          }:80`
                      ]
                    : [],
                forwardedPorts: [
                    isDockerDesktop
                        ? `127.0.0.1:${ports.app}:80`
                        : `127.0.0.1:${ports.app}`
                ],
                healthCheck: {
                    cmd: 'service nginx status'
                },
                mountVolumes: [
                    containerVolume({
                        source: path.join(cacheDir, 'nginx', 'conf.d'),
                        target: '/etc/nginx/conf.d',
                        ro: true,
                        cached: isDockerDesktop
                    }),
                    containerVolume({
                        source: isDockerDesktop ? volumes.php.name : magentoDir,
                        target: containerMagentoDir,
                        rw: true,
                        cached: isDockerDesktop
                    }),
                    containerVolume({
                        source: path.join(
                            cacheDir,
                            'ssl-terminator',
                            'fastcgi_params'
                        ),
                        target: '/etc/nginx/fastcgi_params',
                        ro: true,
                        cached: isDockerDesktop
                    })
                ],
                restart: 'on-failure:5',
                network: isDockerDesktop ? network.name : 'host',
                image: `${
                    nginx.version ? `nginx:${nginx.version}` : nginx.image
                }`,
                name: `${prefix}_nginx`,
                command: "nginx -g 'daemon off;'",
                dependsOn: ['php', 'phpWithXdebug']
            },
            redis: {
                _: 'Redis',
                healthCheck: {
                    cmd: 'redis-cli ping'
                },
                ports: [`127.0.0.1:${ports.redis}:6379`],
                forwardedPorts: [`127.0.0.1:${ports.redis}:6379`],
                mounts: [`source=${volumes.redis.name},target=/data`],
                network: network.name,
                image: `${
                    redis.version ? `redis:${redis.version}` : redis.image
                }`,
                name: `${prefix}_redis`,
                connectCommand: ['redis-cli']
            },
            mariadb: {
                _: 'MariaDB',
                healthCheck: {
                    cmd: `${mariadb.binAdminFileName} ping --silent`
                },
                ports: [`127.0.0.1:${ports.mariadb}:3306`],
                forwardedPorts: [`127.0.0.1:${ports.mariadb}:3306`],
                mountVolumes: [
                    containerVolume({
                        source: volumes.mariadb.name,
                        target: '/var/lib/mysql'
                    }),
                    containerVolume({
                        source: path.join(baseConfig.cacheDir, 'mariadb.cnf'),
                        target: '/etc/mysql/my.cnf',
                        ro: true,
                        cached: isDockerDesktop
                    })
                ],
                env: {
                    MARIADB_ROOT_PASSWORD: 'scandipwa'
                },
                command: '--log_bin_trust_function_creators=1',
                securityOptions: ['seccomp=unconfined'],
                network: network.name,
                image: `${
                    mariadb.version
                        ? `mariadb:${mariadb.version}`
                        : mariadb.image
                }`,
                name: `${prefix}_mariadb`,
                description: `To connect to MariaDB you can use the following users:
- User ${logger.style.command('root')} with password ${logger.style.command(
                    'scandipwa'
                )}
- User ${logger.style.command(
                    defaultMagentoUser.user
                )} with password ${logger.style.command(
                    defaultMagentoUser.password
                )}`
            },
            elasticsearch: {
                _:
                    searchengine === 'elasticsearch'
                        ? 'ElasticSearch'
                        : 'OpenSearch',
                healthCheck: {
                    cmd: 'curl --silent --fail localhost:9200/_cluster/health || exit 1'
                },
                ports: [`127.0.0.1:${ports.elasticsearch}:9200`],
                forwardedPorts: [`127.0.0.1:${ports.elasticsearch}:9200`],
                mountVolumes: [
                    searchengine === 'elasticsearch'
                        ? containerVolume({
                              source: volumes.elasticsearch.name,
                              target: '/usr/share/elasticsearch/data'
                          })
                        : containerVolume({
                              source: volumes.opensearch.name,
                              target: '/usr/share/opensearch/data'
                          })
                ],
                env:
                    searchengine === 'elasticsearch'
                        ? deepmerge(
                              defaultEsEnv,
                              {
                                  // https://www.elastic.co/guide/en/elasticsearch/reference/master/ml-settings.html
                                  'xpack.ml.enabled': ['sse4.2', 'sse4_2'].some(
                                      (sse42Flag) =>
                                          cpuSupportedFlags.includes(sse42Flag)
                                  )
                              },
                              elasticsearch.env || {}
                          )
                        : deepmerge(defaultOsEnv, opensearch.env || {}),
                network: network.name,
                image: `${
                    searchengine === 'elasticsearch'
                        ? elasticsearch.version
                            ? `elasticsearch:${elasticsearch.version}`
                            : elasticsearch.image
                        : opensearch.image
                }`,
                name: `${prefix}_${searchengine}`
            },
            maildev: {
                _: 'MailDev',
                ports: isDockerDesktop
                    ? [
                          `127.0.0.1:${ports.maildevWeb}:1080`,
                          `127.0.0.1:${ports.maildevSMTP}:1025`
                      ]
                    : [],
                forwardedPorts: isDockerDesktop
                    ? [
                          `127.0.0.1:${ports.maildevWeb}:1080`,
                          `127.0.0.1:${ports.maildevSMTP}:1025`
                      ]
                    : [
                          `127.0.0.1:${ports.maildevWeb}`,
                          `127.0.0.1:${ports.maildevSMTP}`
                      ],
                mountVolumes: [
                    containerVolume({
                        source: volumes.maildev.name,
                        target: '/tmp/maildev'
                    })
                ],
                env: {
                    MAILDEV_SMTP_PORT: isDockerDesktop
                        ? '1025'
                        : ports.maildevSMTP,
                    MAILDEV_WEB_PORT: isDockerDesktop
                        ? '1080'
                        : ports.maildevWeb,
                    MAILDEV_MAIL_DIRECTORY: '/tmp/maildev'
                },
                name: `${prefix}_maildev`,
                network: isDockerDesktop ? network.name : 'host',
                image: maildev.image,
                user: !isDockerDesktop ? 'root:root' : '',
                connectCommand: ['/bin/sh'],
                healthCheck: {
                    cmd: `wget -O - http://127.0.0.1:${
                        isDockerDesktop ? '1080' : ports.maildevWeb
                    }/healthz || exit 1`
                }
            }
        }

        if (ssl && ssl.enabled && isDockerDesktop) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            dockerConfig.sslTerminator.ports.push(
                `${isIpAddress(host) ? host : '127.0.0.1'}:443:443`
            )
        }

        if (varnish.enabled) {
            dockerConfig.varnish = {
                _: 'Varnish',
                image: `${
                    varnish.version
                        ? `varnish:${varnish.version}`
                        : varnish.image
                }`,
                name: `${prefix}_varnish`,
                mountVolumes: [
                    containerVolume({
                        source: path.join(cacheDir, 'varnish'),
                        target: '/etc/varnish',
                        ro: true
                    })
                ],
                ports: isDockerDesktop
                    ? [
                          `${isIpAddress(host) ? host : '127.0.0.1'}:${
                              ports.varnish
                          }:80`
                      ]
                    : [],
                forwardedPorts: [
                    isDockerDesktop
                        ? `127.0.0.1:${ports.varnish}:80`
                        : `127.0.0.1:${ports.varnish}`
                ],
                env: {
                    VARNISH_SIZE: '2G'
                },
                restart: 'on-failure:30',
                network: isDockerDesktop ? network.name : 'host',

                command: `/bin/bash -c "varnishd -a :${
                    isDockerDesktop ? 80 : ports.varnish
                } -t 600 -f /etc/varnish/default.vcl -s Cache=malloc,2048m -s Transient=malloc,512m -p http_resp_hdr_len=70000 -p http_resp_size=100000 && varnishlog"`,
                tmpfs: ['/var/lib/varnish/varnishd:exec'],
                description: `Varnish HealthCheck status: ${logger.style.command(
                    varnish.healthCheck ? 'enabled' : 'disabled'
                )}`,
                dependsOn: ['nginx']
            }

            dockerConfig.sslTerminator.dependsOn.push('varnish')
        }

        if (newRelic.enabled) {
            dockerConfig.newRelicPHPDaemon = {
                _: 'New Relic PHP daemon',
                ports: [],
                name: `${prefix}_newrelic-php-daemon`,
                network: isDockerDesktop ? network.name : 'host',
                image: 'newrelic/php-daemon'
            }
        }

        return dockerConfig
    }

    return {
        network,
        volumes,
        getContainers
    }
}
