const os = require('os')
const path = require('path')
const getPhpConfig = require('./php-config')
const { isIpAddress } = require('../util/ip')

const systeminformation = require('systeminformation')
const { deepmerge } = require('../util/deepmerge')
const defaultEsEnv = require('./services/elasticsearch/default-es-env')
const logger = require('@scandipwa/scandipwa-dev-utils/logger')
const defaultMagentoUser = require('../tasks/database/default-magento-user')

/**
 *
 * @param {import('../../typings/context').ListrContext} ctx
 * @param {import('../../typings/context').ListrContext['config']['overridenConfiguration']} overridenConfiguration
 * @param {import('../../typings/context').ListrContext['config']['baseConfig']} baseConfig
 */
module.exports = async (ctx, overridenConfiguration, baseConfig) => {
    const { configuration, ssl, host } = overridenConfiguration
    const { nginx, redis, elasticsearch, mariadb, varnish, maildev } =
        configuration

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
        maildev: {
            name: `${prefix}_maildev-data`
        },
        composer_cache: {
            name: 'composer_cache-data'
        }
    }

    const { isDockerDesktop } = ctx

    if (isDockerDesktop) {
        /**
         * When CMA is running with Docker Desktop,
         * we need create named volumes to avoid performance penalty
         */
        volumes.php = {
            name: `${prefix}_project-data`,
            driver: 'local',
            opt: {
                type: 'none',
                device: path.join(magentoDir),
                o: 'bind'
            }
        }
        volumes.nginx = {
            name: `${prefix}_nginx-data`,
            driver: 'local',
            opt: {
                type: 'none',
                device: path.join(cacheDir, 'nginx', 'conf.d'),
                o: 'bind'
            }
        }
        volumes.appPub = {
            name: `${prefix}_pub-data`,
            driver: 'local',
            opt: {
                type: 'none',
                device: path.join(magentoDir, 'pub'),
                o: 'bind'
            }
        }
        volumes.appSetup = {
            name: `${prefix}_setup-data`,
            driver: 'local',
            opt: {
                type: 'none',
                device: path.join(magentoDir, 'setup'),
                o: 'bind'
            }
        }
        volumes.sslTerminator = {
            name: `${prefix}_ssl-terminator-data`,
            driver: 'local',
            opt: {
                type: 'none',
                device: path.join(cacheDir, 'ssl-terminator', 'conf.d'),
                o: 'bind'
            }
        }

        if (varnish.enabled) {
            volumes.varnish = {
                name: `${prefix}_varnish-data`,
                driver: 'local',
                opt: {
                    type: 'none',
                    device: path.join(cacheDir, 'varnish'),
                    o: 'bind'
                }
            }
        }
    }

    /**
     * @param {Record<string, number>} ports
     */
    const getContainers = (ports = {}) => {
        /**
         * @type {Record<string, import('../tasks/docker/containers/container-api').ContainerRunOptions & { _?: string, forwardedPorts?: string[], debugImage?: string, remoteImages?: string[], connectCommand?: string[], description?: string }>}
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
                    `${
                        !isDockerDesktop ? magentoDir : volumes.php.name
                    }:${containerMagentoDir}`,
                    `${volumes.composer_cache.name}:/composer/home/cache`,
                    `${php.iniPath}:/usr/local/etc/php/php.ini`,
                    `${php.fpmConfPath}:/usr/local/etc/php-fpm.d/zz-docker.conf`
                ].concat(
                    ctx.debug
                        ? [
                              `${php.debugIniPath}:/usr/local/etc/php/conf.d/00-xdebug.ini`
                          ]
                        : []
                ),
                env: process.env.COMPOSER_AUTH
                    ? {
                          COMPOSER_AUTH: JSON.stringify(
                              JSON.parse(process.env.COMPOSER_AUTH),
                              null,
                              0
                          )
                      }
                    : {},
                restart: 'on-failure:5',
                image: `local-cma-project:${prefix}`,
                debugImage: `local-cma-project:${prefix}.debug`,
                remoteImages: [
                    configuration.php.baseImage,
                    configuration.php.debugImage
                ],
                name: `${prefix}_php`,
                connectCommand: ['/bin/sh'],
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
                /**
                 * Mount volumes directly on linux
                 */
                mountVolumes: [
                    `${
                        !isDockerDesktop
                            ? path.join(cacheDir, 'ssl-terminator', 'conf.d')
                            : volumes.sslTerminator.name
                    }:/etc/nginx/conf.d`,
                    `${path.join(
                        cacheDir,
                        'ssl-terminator',
                        'fastcgi_params'
                    )}:/etc/nginx/fastcgi_params`
                ],
                restart: 'on-failure:5',
                network: isDockerDesktop ? network.name : 'host',
                image: `${
                    nginx.version ? `nginx:${nginx.version}` : nginx.image
                }`,
                name: `${prefix}_ssl-terminator`,
                command: "nginx -g 'daemon off;'"
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
                /**
                 * Mount volumes directly on linux
                 */
                mountVolumes: !isDockerDesktop
                    ? [
                          `${cacheDir}/nginx/conf.d:/etc/nginx/conf.d`,
                          `${path.join(magentoDir, 'pub')}:${path.join(
                              containerMagentoDir,
                              'pub'
                          )}`,
                          `${path.join(magentoDir, 'setup')}:${path.join(
                              containerMagentoDir,
                              'setup'
                          )}`,
                          `${path.join(
                              cacheDir,
                              'ssl-terminator',
                              'fastcgi_params'
                          )}:/etc/nginx/fastcgi_params`
                      ]
                    : [
                          `${volumes.nginx.name}:/etc/nginx/conf.d`,
                          `${volumes.appPub.name}:${path.join(
                              containerMagentoDir,
                              'pub'
                          )}`,
                          `${volumes.appSetup.name}:${path.join(
                              containerMagentoDir,
                              'setup'
                          )}`,
                          `${path.join(
                              cacheDir,
                              'ssl-terminator',
                              'fastcgi_params'
                          )}:/etc/nginx/fastcgi_params`
                      ],
                restart: 'on-failure:5',
                network: isDockerDesktop ? network.name : 'host',
                image: `${
                    nginx.version ? `nginx:${nginx.version}` : nginx.image
                }`,
                name: `${prefix}_nginx`,
                command: "nginx -g 'daemon off;'"
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
                    cmd: 'mysqladmin ping --silent'
                },
                ports: [`127.0.0.1:${ports.mariadb}:3306`],
                forwardedPorts: [`127.0.0.1:${ports.mariadb}:3306`],
                mountVolumes: [
                    `${volumes.mariadb.name}:/var/lib/mysql`,
                    `${path.join(
                        baseConfig.cacheDir,
                        'mariadb.cnf'
                    )}:/etc/mysql/my.cnf`
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
                _: 'ElasticSearch',
                healthCheck: {
                    cmd: 'curl --silent --fail localhost:9200/_cluster/health || exit 1'
                },
                ports: [`127.0.0.1:${ports.elasticsearch}:9200`],
                forwardedPorts: [`127.0.0.1:${ports.elasticsearch}:9200`],
                mounts: [
                    `source=${volumes.elasticsearch.name},target=/usr/share/elasticsearch/data`
                ],
                env: deepmerge(
                    {
                        // https://www.elastic.co/guide/en/elasticsearch/reference/master/ml-settings.html
                        'xpack.ml.enabled': ['sse4.2', 'sse4_2'].some(
                            (sse42Flag) => cpuSupportedFlags.includes(sse42Flag)
                        )
                    },
                    elasticsearch.env || defaultEsEnv
                ),
                network: network.name,
                image: `${
                    elasticsearch.version
                        ? `elasticsearch:${elasticsearch.version}`
                        : elasticsearch.image
                }`,
                name: `${prefix}_elasticsearch`
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
                mountVolumes: [`${volumes.maildev.name}:/tmp/maildev`],
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
            dockerConfig.sslTerminator.ports.push(
                `${isIpAddress(host) ? host : '127.0.0.1'}:443:443`
            )
        }

        if (!ctx.debug && varnish.enabled) {
            dockerConfig.varnish = {
                _: 'Varnish',
                image: `${
                    varnish.version
                        ? `varnish:${varnish.version}`
                        : varnish.image
                }`,
                name: `${prefix}_varnish`,
                mountVolumes: [
                    `${
                        !isDockerDesktop
                            ? path.join(cacheDir, 'varnish')
                            : volumes.varnish.name
                    }:/etc/varnish`
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
                tmpfs: ['/var/lib/varnish:exec'],
                description: `Varnish HealthCheck status: ${logger.style.command(
                    varnish.healthCheck ? 'enabled' : 'disabled'
                )}`
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
